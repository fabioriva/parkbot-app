import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { data } from "react-router";
import { db } from "~/lib/db.server";

const COLLECTION = "sessions";

export async function action({ request }) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader === null) {
    return data(
      { message: "Unauthorized" },
      {
        headers: { "X-Custom-Header": "unauthorized" },
        status: 401,
        statusText: "Authorization header missing",
      }
    );
  }
  //
  const token = authHeader.split(" ")[1];
  // console.log(authHeader, token);
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  // console.log(sessionId);
  const sessions = db.collection(COLLECTION);
  const result = await sessions
    .aggregate([
      { $match: { id: sessionId } }, // Filter documents
      { $limit: 1 },
      {
        $lookup: {
          from: "users", // Foreign collection to join
          localField: "userId", // Field in the local 'sessions' collection
          foreignField: "id", // Field in the foreign 'users' collection
          as: "user", // Alias for the joined data, output array field
        },
      },
      {
        $unwind: "$user", // Deconstructs the array to a single document
      },
      {
        $lookup: {
          from: "aps",
          localField: "apsId",
          foreignField: "ns",
          as: "aps",
        },
      },
      {
        $unwind: { path: "$aps", preserveNullAndEmptyArrays: true },
      },
    ])
    .toArray();
  // console.log("/action/get-session", result);
  if (result.length === 0) {
    return data(
      { message: "Unauthorized" },
      {
        headers: { "X-Custom-Header": "unauthorized" },
        status: 401,
        statusText: "Authorization error",
      }
    );
  }

  const sessionValidationResult = result.shift();
  const { aps, user } = sessionValidationResult;

  return data(
    { aps, user }, // TODO: send only aps.ns and user rights/roles
    { headers: { "X-Custom-Header": "value" }, status: 200 }
  );
}
