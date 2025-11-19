import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { data } from "react-router";
import { db } from "~/lib/db.server";

const COLLECTION = "sessions";

function exec_time(ping) {
  const pong = process.hrtime(ping);
  const time = (pong[0] * 1000000000 + pong[1]) / 1000000;
  return time + "ms";
}

export async function action({ request }) {
  let ping = process.hrtime();
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return data(
      {},
      {
        headers: { "X-Processing-Time": exec_time(ping) },
        status: 401,
        statusText: "Authorization header missing",
      }
    );
  }
  const token = authHeader.split(" ")[1];
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
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
  if (result.length === 0) {
    return data(
      {},
      {
        headers: { "X-Processing-Time": exec_time(ping) },
        status: 401,
        statusText: "Authorization token not valid",
      }
    );
  }
  const sessionValidationResult = result.shift();
  const { aps, user } = sessionValidationResult;

  return data(
    { aps, user }, // TODO: send only aps.ns and user rights/roles
    {
      headers: { "X-Processing-Time": exec_time(ping) },
      status: 200,
    }
  );
}
