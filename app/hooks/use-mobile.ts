import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(breakpoint: number = 76) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

// // hooks/use-mobile.ts
// import { useEffect, useState } from "react";

// // Custom hook to detect if the screen is mobile-sized
// export function useIsMobile(breakpoint: number = 768) {
//   const [isMobile, setIsMobile] = useState<boolean>(
//     typeof window !== "undefined" ? window.innerWidth < breakpoint : false
//   );

//   useEffect(() => {
//     function handleResize() {
//       setIsMobile(window.innerWidth < breakpoint);
//     }

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [breakpoint]);

//   return isMobile;
// }
