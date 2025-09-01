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
    ...prefix("2fa", [
      route("authentication", "routes/auth/2fa/authentication.tsx"),
      route("reset", "routes/auth/2fa/reset.tsx"),
      route("setup", "routes/auth/2fa/setup.tsx"),
    ]),
    // route("2fa/authentication", "routes/auth/2fa/authentication.tsx"),
    // route("2fa/reset", "routes/auth/2fa/reset.tsx"),
    // route("2fa/setup", "routes/auth/2fa/setup.tsx"),
    route("forgot-password", "routes/auth/forgot-password.tsx"),
    route("login", "routes/auth/login.tsx"),
    route("logout", "routes/auth/logout.tsx"),
    route("recovery-code", "routes/auth/recovery-code.tsx"),
    ...prefix("reset-password", [
      route("2fa", "routes/auth/reset/2fa.tsx"),
      route("password", "routes/auth/reset/password.tsx"),
      route("verify-email", "routes/auth/reset/verify.tsx"),
    ]),
    // route("reset/2fa", "routes/auth/reset/2fa.tsx"),
    // route("reset/password", "routes/auth/reset/password.tsx"),
    // route("reset/verify-email", "routes/auth/reset/verify.tsx"),
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
