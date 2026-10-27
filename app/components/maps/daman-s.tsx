import { Level } from "~/components/map-level"
import type { MapProps } from "./types"

export default function Map({ data, view }: MapProps) {
  // return (
  //   <div>
  //     <h2>Data</h2>
  //     <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
  //   </div>
  // );
  const levels = [...data.levels].reverse() // Creates a copy and reverses it
  return (
    <div className="flex flex-col gap-3 overflow-auto p-0.5">
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
          height: 160px;
          width: 1153px;
        }
        #el-1 {
          top: 33px;
          left: 207px;
        }
        #el-2 {
          top: 33px;
          left: 289px;
        }
        #el-3 {
          top: 33px;
          left: 371px;
        }
        #el-4 {
          top: 33px;
          left: 453px;
        }
        #el-5 {
          top: 33px;
          left: 535px;
        }
        #s-1 {
          top: 2px;
          left: 2px;
        }
        #s-2 {
          top: 33px;
          left: 2px;
        }
        #s-3 {
          top: 95px;
          left: 2px;
        }
        #s-4 {
          top: 126px;
          left: 2px;
        }
        #s-5 {
          top: 2px;
          left: 43px;
        }
        #s-6 {
          top: 33px;
          left: 43px;
        }
        #s-7 {
          top: 95px;
          left: 43px;
        }
        #s-8 {
          top: 126px;
          left: 43px;
        }
        #s-9 {
          top: 2px;
          left: 84px;
        }
        #s-10 {
          top: 33px;
          left: 84px;
        }
        #s-11 {
          top: 95px;
          left: 84px;
        }
        #s-12 {
          top: 126px;
          left: 84px;
        }
        #s-13 {
          top: 2px;
          left: 125px;
        }
        #s-14 {
          top: 33px;
          left: 125px;
        }
        #s-15 {
          top: 95px;
          left: 125px;
        }
        #s-16 {
          top: 126px;
          left: 125px;
        }
        #s-17 {
          top: 2px;
          left: 166px;
        }
        #s-18 {
          top: 33px;
          left: 166px;
        }
        #s-19 {
          top: 95px;
          left: 166px;
        }
        #s-20 {
          top: 126px;
          left: 166px;
        }
        #s-21 {
          top: 2px;
          left: 207px;
        }
        #s-22 {
          top: 95px;
          left: 207px;
        }
        #s-23 {
          top: 126px;
          left: 207px;
        }
        #s-24 {
          top: 2px;
          left: 248px;
        }
        #s-25 {
          top: 33px;
          left: 248px;
        }
        #s-26 {
          top: 95px;
          left: 248px;
        }
        #s-27 {
          top: 126px;
          left: 248px;
        }
        #s-28 {
          top: 2px;
          left: 289px;
        }
        #s-29 {
          top: 95px;
          left: 289px;
        }
        #s-30 {
          top: 126px;
          left: 289px;
        }
        #s-31 {
          top: 2px;
          left: 330px;
        }
        #s-32 {
          top: 33px;
          left: 330px;
        }
        #s-33 {
          top: 95px;
          left: 330px;
        }
        #s-34 {
          top: 126px;
          left: 330px;
        }
        #s-35 {
          top: 2px;
          left: 371px;
        }
        #s-36 {
          top: 95px;
          left: 371px;
        }
        #s-37 {
          top: 126px;
          left: 371px;
        }
        #s-38 {
          top: 2px;
          left: 412px;
        }
        #s-39 {
          top: 33px;
          left: 412px;
        }
        #s-40 {
          top: 95px;
          left: 412px;
        }
        #s-41 {
          top: 126px;
          left: 412px;
        }
        #s-42 {
          top: 2px;
          left: 453px;
        }
        #s-43 {
          top: 95px;
          left: 453px;
        }
        #s-44 {
          top: 126px;
          left: 453px;
        }
        #s-45 {
          top: 2px;
          left: 494px;
        }
        #s-46 {
          top: 33px;
          left: 494px;
        }
        #s-47 {
          top: 95px;
          left: 494px;
        }
        #s-48 {
          top: 126px;
          left: 494px;
        }
        #s-49 {
          top: 2px;
          left: 535px;
        }
        #s-50 {
          top: 95px;
          left: 535px;
        }
        #s-51 {
          top: 126px;
          left: 535px;
        }
        #s-52 {
          top: 2px;
          left: 576px;
        }
        #s-53 {
          top: 33px;
          left: 576px;
        }
        #s-54 {
          top: 95px;
          left: 576px;
        }
        #s-55 {
          top: 126px;
          left: 576px;
        }
        #s-56 {
          top: 33px;
          left: 617px;
        }
        #s-57 {
          top: 95px;
          left: 617px;
        }
        #s-58 {
          top: 126px;
          left: 617px;
        }
        #s-59 {
          top: 33px;
          left: 658px;
        }
        #s-60 {
          top: 95px;
          left: 658px;
        }
        #s-61 {
          top: 126px;
          left: 658px;
        }
        #s-62 {
          top: 95px;
          left: 699px;
        }
        #s-63 {
          top: 126px;
          left: 699px;
        }
        #s-64 {
          top: 33px;
          left: 740px;
        }
        #s-65 {
          top: 95px;
          left: 740px;
        }
        #s-66 {
          top: 126px;
          left: 740px;
        }
        #s-67 {
          top: 33px;
          left: 781px;
        }
        #s-68 {
          top: 33px;
          left: 822px;
        }
        #s-69 {
          top: 95px;
          left: 822px;
        }
        #s-70 {
          top: 126px;
          left: 822px;
        }
        #s-71 {
          top: 33px;
          left: 863px;
        }
        #s-72 {
          top: 95px;
          left: 863px;
        }
        #s-73 {
          top: 126px;
          left: 863px;
        }
        #s-74 {
          top: 33px;
          left: 904px;
        }
        #s-75 {
          top: 2px;
          left: 945px;
        }
        #s-76 {
          top: 33px;
          left: 945px;
        }
        #s-77 {
          top: 95px;
          left: 945px;
        }
        #s-78 {
          top: 126px;
          left: 945px;
        }
           #s-75 {
          top: 2px;
          left: 945px;
        }
        #s-76 {
          top: 33px;
          left: 945px;
        }
        #s-77 {
          top: 95px;
          left: 945px;
        }
        #s-78 {
          top: 126px;
          left: 945px;
        }
        #s-79 {
          top: 2px;
          left: 986px;
        }
        #s-80 {
          top: 33px;
          left: 986px;
        }
        #s-81 {
          top: 95px;
          left: 986px;
        }
        #s-82 {
          top: 126px;
          left: 986px;
        }
        #s-83 {
          top: 2px;
          left: 1027px;
        }
        #s-84 {
          top: 33px;
          left: 1027px;
        }
        #s-85 {
          top: 95px;
          left: 1027px;
        }
        #s-86 {
          top: 126px;
          left: 1027px;
        }
        #s-87 {
          top: 2px;
          left: 1068px;
        }
        #s-88 {
          top: 33px;
          left: 1068px;
        }
        #s-89 {
          top: 95px;
          left: 1068px;
        }
        #s-90 {
          top: 126px;
          left: 1068px;
        }
        #s-91 {
          top: 2px;
          left: 1109px;
        }
        #s-92 {
          top: 33px;
          left: 1109px;
        }
        #s-93 {
          top: 95px;
          left: 1109px;
        }
        #s-94 {
          top: 126px;
          left: 1109px;
        }
        #s-95, #s-189 { top: 2px; left: 2px; }
        #s-96, #s-190 { top: 33px; left: 2px; }
        #s-97, #s-191 { top: 95px; left: 2px; }
        #s-98, #s-192 { top: 126px; left: 2px; }
        #s-99, #s-193 { top: 2px; left: 43px; }
        #s-100, #s-194 { top: 33px; left: 43px; }
        #s-101, #s-195 { top: 95px; left: 43px; }
        #s-102, #s-196 { top: 126px; left: 43px; }
        #s-103, #s-197 { top: 2px; left: 84px; }
        #s-104, #s-198 { top: 33px; left: 84px; }
        #s-105, #s-199 { top: 95px; left: 84px; }
        #s-106, #s-200 { top: 126px; left: 84px; }
        #s-107, #s-201 { top: 2px; left: 125px; }
        #s-108, #s-202 { top: 33px; left: 125px; }
        #s-109, #s-203 { top: 95px; left: 125px; }
        #s-110, #s-204 { top: 126px; left: 125px; }
        #s-111, #s-205 { top: 2px; left: 166px; }
        #s-112, #s-206 { top: 33px; left: 166px; }
        #s-113, #s-207 { top: 95px; left: 166px; }
        #s-114, #s-208 { top: 126px; left: 166px; }
        #s-115, #s-209 { top: 2px; left: 207px; }
        #s-116, #s-210 { top: 95px; left: 207px; }
        #s-117, #s-211 { top: 126px; left: 207px; }
        #s-118, #s-212 { top: 2px; left: 248px; }
        #s-119, #s-213 { top: 33px; left: 248px; }
        #s-120, #s-214 { top: 95px; left: 248px; }
        #s-121, #s-215 { top: 126px; left: 248px; }
        #s-122, #s-216 { top: 2px; left: 289px; }
        #s-123, #s-217 { top: 95px; left: 289px; }
        #s-124, #s-218 { top: 126px; left: 289px; }
        #s-125, #s-219 { top: 2px; left: 330px; }
        #s-126, #s-220 { top: 33px; left: 330px; }
        #s-127, #s-221 { top: 95px; left: 330px; }
        #s-128, #s-222 { top: 126px; left: 330px; }
        #s-129, #s-223 { top: 2px; left: 371px; }
        #s-130, #s-224 { top: 95px; left: 371px; }
        #s-131, #s-225 { top: 126px; left: 371px; }
        #s-132, #s-226 { top: 2px; left: 412px; }
        #s-133, #s-227 { top: 33px; left: 412px; }
        #s-134, #s-228 { top: 95px; left: 412px; }
        #s-135, #s-229 { top: 126px; left: 412px; }
        #s-136, #s-230 { top: 2px; left: 453px; }
        #s-137, #s-231 { top: 95px; left: 453px; }
        #s-138, #s-232 { top: 126px; left: 453px; }
        #s-139, #s-233 { top: 2px; left: 494px; }
        #s-140, #s-234 { top: 33px; left: 494px; }
        #s-141, #s-235 { top: 95px; left: 494px; }
        #s-142, #s-236 { top: 126px; left: 494px; }
        #s-143, #s-237 { top: 2px; left: 535px; }
        #s-144, #s-238 { top: 95px; left: 535px; }
        #s-145, #s-239 { top: 126px; left: 535px; }
        #s-146, #s-240 { top: 2px; left: 576px; }
        #s-147, #s-241 { top: 33px; left: 576px; }
        #s-148, #s-242 { top: 95px; left: 576px; }
        #s-149, #s-243 { top: 126px; left: 576px; }
        #s-150, #s-244 { top: 33px; left: 617px; }
        #s-151, #s-245 { top: 95px; left: 617px; }
        #s-152, #s-246 { top: 126px; left: 617px; }
        #s-153, #s-247 { top: 33px; left: 658px; }
        #s-154, #s-248 { top: 95px; left: 658px; }
        #s-155, #s-249 { top: 126px; left: 658px; }
        #s-156, #s-250 { top: 95px; left: 699px; }
        #s-157, #s-251 { top: 126px; left: 699px; }
        #s-158, #s-252 { top: 33px; left: 740px; }
        #s-159, #s-253 { top: 95px; left: 740px; }
        #s-160, #s-254 { top: 126px; left: 740px; }
        #s-161, #s-255 { top: 33px; left: 781px; }
        #s-162, #s-256 { top: 33px; left: 822px; }
        #s-163, #s-257 { top: 95px; left: 822px; }
        #s-164, #s-258 { top: 126px; left: 822px; }
        #s-165, #s-259 { top: 33px; left: 863px; }
        #s-166, #s-260 { top: 95px; left: 863px; }
        #s-167, #s-261 { top: 126px; left: 863px; }
        #s-168, #s-262 { top: 33px; left: 904px; }
        #s-169, #s-263 { top: 2px; left: 945px; }
        #s-170, #s-264 { top: 33px; left: 945px; }
        #s-171, #s-265 { top: 95px; left: 945px; }
        #s-172, #s-266 { top: 126px; left: 945px; }
        #s-173, #s-267 { top: 2px; left: 986px; }
        #s-174, #s-268 { top: 33px; left: 986px; }
        #s-175, #s-269 { top: 95px; left: 986px; }
        #s-176, #s-270 { top: 126px; left: 986px; }
        #s-177, #s-271 { top: 2px; left: 1027px; }
        #s-178, #s-272 { top: 33px; left: 1027px; }
        #s-179, #s-273 { top: 95px; left: 1027px; }
        #s-180, #s-274 { top: 126px; left: 1027px; }
        #s-181, #s-275 { top: 2px; left: 1068px; }
        #s-182, #s-276 { top: 33px; left: 1068px; }
        #s-183, #s-277 { top: 95px; left: 1068px; }
        #s-184, #s-278 { top: 126px; left: 1068px; }
        #s-185, #s-279 { top: 2px; left: 1109px; }
        #s-186, #s-280 { top: 33px; left: 1109px; }
        #s-187, #s-281 { top: 95px; left: 1109px; }
        #s-188, #s-282 { top: 126px; left: 1109px; }
        #s-283 {
          top: 2px;
          left: 2px;
        }
        #s-284 {
          top: 33px;
          left: 2px;
        }
        #s-285 {
          top: 95px;
          left: 2px;
        }
        #s-286 {
          top: 2px;
          left: 43px;
        }
        #s-287 {
          top: 33px;
          left: 43px;
        }
        #s-288 {
          top: 95px;
          left: 43px;
        }
        #s-289 {
          top: 2px;
          left: 84px;
        }
        #s-290 {
          top: 33px;
          left: 84px;
        }
        #s-291 {
          top: 95px;
          left: 84px;
        }
        #s-292 {
          top: 2px;
          left: 125px;
        }
        #s-293 {
          top: 33px;
          left: 125px;
        }
        #s-294 {
          top: 95px;
          left: 125px;
        }
        #s-295 {
          top: 95px;
          left: 166px;
        }
        #s-296 {
          top: 2px;
          left: 207px;
        }
        #s-297 {
          top: 95px;
          left: 207px;
        }
        #s-298 {
          top: 2px;
          left: 248px;
        }
        #s-299 {
          top: 33px;
          left: 248px;
        }
        #s-300 {
          top: 95px;
          left: 248px;
        }
        #s-301 {
          top: 2px;
          left: 289px;
        }
        #s-302 {
          top: 33px;
          left: 289px;
        }
        #s-303 {
          top: 95px;
          left: 289px;
        }
        #s-304 {
          top: 2px;
          left: 330px;
        }
        #s-305 {
          top: 33px;
          left: 330px;
        }
        #s-306 {
          top: 95px;
          left: 330px;
        }
        #s-307 {
          top: 2px;
          left: 371px;
        }
        #s-308 {
          top: 95px;
          left: 371px;
        }
        #s-309 {
          top: 2px;
          left: 412px;
        }
        #s-310 {
          top: 33px;
          left: 412px;
        }
        #s-311 {
          top: 95px;
          left: 412px;
        }
        #s-312 {
          top: 2px;
          left: 453px;
        }
        #s-313 {
          top: 33px;
          left: 453px;
        }
        #s-314 {
          top: 95px;
          left: 453px;
        }
        #s-315 {
          top: 2px;
          left: 494px;
        }
        #s-316 {
          top: 33px;
          left: 494px;
        }
        #s-317 {
          top: 95px;
          left: 494px;
        }
        #s-318 {
          top: 2px;
          left: 535px;
        }
        #s-319 {
          top: 33px;
          left: 535px;
        }
        #s-320 {
          top: 95px;
          left: 535px;
        }
        #s-321 {
          top: 33px;
          left: 576px;
        }
        #s-322 {
          top: 95px;
          left: 576px;
        }
      `}</style>
    </div>
  )
}
