import {
  type RouteConfig,
  index,
  layout,
  prefix,
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
    route("recovery-code", "routes/auth/recovery-code.tsx"),
    route("reset/verify-email", "routes/auth/reset/verify-email.tsx"),
    route("signup", "routes/auth/signup.tsx"),
    route("verify-email", "routes/auth/verify-email.tsx"),
  ]),
  ...prefix("aps", [
    layout("routes/aps/layout.tsx", [
      route(":aps/dashboard", "routes/aps/dashboard.tsx"),
    ]),
  ]),
  route("api/locales/:lng/:ns", "./routes/locales.ts"),
  route("*", "./routes/not-found.tsx"),
] satisfies RouteConfig;
