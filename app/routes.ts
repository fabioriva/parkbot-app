import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  // ...
  route("api/locales/:lng/:ns", "./routes/locales.ts"),
  route("*", "./routes/not-found.tsx"),
] satisfies RouteConfig;
