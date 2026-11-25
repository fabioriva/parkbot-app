import { Level } from "~/components/map-level"
import type { MapProps } from "./types"

export default function Map({ data, view }: MapProps) {
  const levels = [...data.levels].reverse() // Creates a copy and reverses it
  return (
    <div className="flex flex-wrap gap-3 overflow-auto">
      {levels.map((level) => (
        <Level
          definitions={data.definitions}
          level={level}
          view={view}
          key={level.nr}
        />
      ))}
      <style>{`
        .level {
          height: 161px;
          width: 169px;
        }
        #el-1 {
          top: 64px;
          left: 2px;
        }
        #el-2 {
          top: 64px;
          left: 125px;
        }
        /* P1 */
        #s-1 {
          top: 126px;
          left: 2px;
        }
        #s-2 {
          top: 95px;
          left: 2px;
        }
        #s-3 {
          top: 33px;
          left: 2px;
        }
        #s-4 {
          top: 2px;
          left: 2px;
        }
        #s-5 {
          top: 126px;
          left: 43px;
        }
        #s-6 {
          top: 95px;
          left: 43px;
        }
        #s-7 {
          top: 33px;
          left: 43px;
        }
        #s-8 {
          top: 2px;
          left: 43px;
        }
        #s-9 {
          top: 126px;
          left: 84px;
        }
        #s-10 {
          top: 95px;
          left: 84px;
        }
        #s-11 {
          top: 33px;
          left: 84px;
        }
        #s-12 {
          top: 2px;
          left: 84px;
        }
        #s-13 {
          top: 126px;
          left: 125px;
        }
        #s-14 {
          top: 95px;
          left: 125px;
        }
        #s-15 {
          top: 33px;
          left: 125px;
        }
        #s-16 {
          top: 2px;
          left: 125px;
        }
        /* P2-P17 */
        #s-17,
        #s-33,
        #s-49,
        #s-65,
        #s-81,
        #s-97,
        #s-113,
        #s-129,
        #s-145,
        #s-161,
        #s-177,
        #s-193,
        #s-209,
        #s-225,
        #s-241,
        #s-257 {
          top: 126px;
          left: 2px;
        }
        #s-18,
        #s-34,
        #s-50,
        #s-66,
        #s-82,
        #s-98,
        #s-114,
        #s-130,
        #s-146,
        #s-162,
        #s-178,
        #s-194,
        #s-210,
        #s-226,
        #s-242,
        #s-258 {
          top: 95px;
          left: 2px;
        }
        #s-19,
        #s-35,
        #s-51,
        #s-67,
        #s-83,
        #s-99,
        #s-115,
        #s-131,
        #s-147,
        #s-163,
        #s-179,
        #s-195,
        #s-211,
        #s-227,
        #s-243,
        #s-259 {
          top: 33px;
          left: 2px;
        }
        #s-20,
        #s-36,
        #s-52,
        #s-68,
        #s-84,
        #s-100,
        #s-116,
        #s-132,
        #s-148,
        #s-164,
        #s-180,
        #s-196,
        #s-212,
        #s-228,
        #s-244,
        #s-260 {
          top: 2px;
          left: 2px;
        }
        #s-21,
        #s-37,
        #s-53,
        #s-69,
        #s-85,
        #s-101,
        #s-117,
        #s-133,
        #s-149,
        #s-165,
        #s-181,
        #s-197,
        #s-213,
        #s-229,
        #s-245,
        #s-261 {
          top: 126px;
          left: 43px;
        }
        #s-22,
        #s-38,
        #s-54,
        #s-70,
        #s-86,
        #s-102,
        #s-118,
        #s-134,
        #s-150,
        #s-166,
        #s-182,
        #s-198,
        #s-214,
        #s-230,
        #s-246,
        #s-262 {
          top: 95px;
          left: 43px;
        }
        #s-23,
        #s-39,
        #s-55,
        #s-71,
        #s-87,
        #s-103,
        #s-119,
        #s-135,
        #s-151,
        #s-167,
        #s-183,
        #s-199,
        #s-215,
        #s-231,
        #s-247,
        #s-263 {
          top: 33px;
          left: 43px;
        }
        #s-24,
        #s-40,
        #s-56,
        #s-72,
        #s-88,
        #s-104,
        #s-120,
        #s-136,
        #s-152,
        #s-168,
        #s-184,
        #s-200,
        #s-216,
        #s-232,
        #s-248,
        #s-264 {
          top: 2px;
          left: 43px;
        }
        #s-25,
        #s-41,
        #s-57,
        #s-73,
        #s-89,
        #s-105,
        #s-121,
        #s-137,
        #s-153,
        #s-169,
        #s-185,
        #s-201,
        #s-217,
        #s-233,
        #s-249,
        #s-265 {
          top: 126px;
          left: 84px;
        }
        #s-26,
        #s-42,
        #s-58,
        #s-74,
        #s-90,
        #s-106,
        #s-122,
        #s-138,
        #s-154,
        #s-170,
        #s-186,
        #s-202,
        #s-218,
        #s-234,
        #s-250,
        #s-266 {
          top: 95px;
          left: 84px;
        }
        #s-27,
        #s-43,
        #s-59,
        #s-75,
        #s-91,
        #s-107,
        #s-123,
        #s-139,
        #s-155,
        #s-171,
        #s-187,
        #s-203,
        #s-219,
        #s-235,
        #s-251,
        #s-267 {
          top: 33px;
          left: 84px;
        }
        #s-28,
        #s-44,
        #s-60,
        #s-76,
        #s-92,
        #s-108,
        #s-124,
        #s-140,
        #s-156,
        #s-172,
        #s-188,
        #s-204,
        #s-220,
        #s-236,
        #s-252,
        #s-268 {
          top: 2px;
          left: 84px;
        }
        #s-29,
        #s-45,
        #s-61,
        #s-77,
        #s-93,
        #s-109,
        #s-125,
        #s-141,
        #s-157,
        #s-173,
        #s-189,
        #s-205,
        #s-221,
        #s-237,
        #s-253,
        #s-269 {
          top: 126px;
          left: 125px;
        }
        #s-30,
        #s-46,
        #s-62,
        #s-78,
        #s-94,
        #s-110,
        #s-126,
        #s-142,
        #s-158,
        #s-174,
        #s-190,
        #s-206,
        #s-222,
        #s-238,
        #s-254,
        #s-270 {
          top: 95px;
          left: 125px;
        }
        #s-31,
        #s-47,
        #s-63,
        #s-79,
        #s-95,
        #s-111,
        #s-127,
        #s-143,
        #s-159,
        #s-175,
        #s-191,
        #s-207,
        #s-223,
        #s-239,
        #s-255,
        #s-271 {
          top: 33px;
          left: 125px;
        }
        #s-32,
        #s-48,
        #s-64,
        #s-80,
        #s-96,
        #s-112,
        #s-128,
        #s-144,
        #s-160,
        #s-176,
        #s-192,
        #s-208,
        #s-224,
        #s-240,
        #s-256,
        #s-272 {
          top: 2px;
          left: 125px;
        }

      `}</style>
    </div>
  )
}
