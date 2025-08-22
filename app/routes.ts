import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("routes/auth/layout.tsx", [
    route("2fa/authentication", "routes/auth/2fa/authentication.tsx"),
    route("2fa/reset", "routes/auth/2fa/reset.tsx"),
    route("2fa/setup", "routes/auth/2fa/setup.tsx"),
    route("forgot-password", "routes/auth/forgot-password.tsx"),
    route("login", "routes/auth/login.tsx"),
    route("logout", "routes/auth/logout.tsx"),
    route("signup", "routes/auth/signup.tsx"),
    route("verify-email", "routes/auth/verify-email.tsx"),
  ]),
  route("api/locales/:lng/:ns", "./routes/locales.ts"),
  route("*", "./routes/not-found.tsx"),
] satisfies RouteConfig;
