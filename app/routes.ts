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
    route("2fa-reset", "routes/auth/2fa-reset.tsx"),
    route("2fa-setup", "routes/auth/2fa-setup.tsx"),
    route("2fa-verify", "routes/auth/2fa-verify.tsx"),
    route("aps-select", "routes/auth/aps-select.tsx"),
    route("password-change", "routes/auth/password-change.tsx"),
    route("password-forgot", "routes/auth/password-forgot.tsx"),
    route("password-reset", "routes/auth/password-reset.tsx"),
    route("signin", "routes/auth/signin.tsx"),
    route("signout", "routes/auth/signout.tsx"),
    route("signup", "routes/auth/signup.tsx"),
    route("verify-email", "routes/auth/verify-email.tsx"),
  ]),
  ...prefix("aps", [
    layout("routes/aps/layout.tsx", [
      route(":aps/dashboard", "routes/aps/dashboard.tsx"),
      route(":aps/devices", "routes/aps/devices.tsx"),
      route(":aps/history", "routes/aps/history.tsx"),
      route(":aps/map", "routes/aps/map.tsx"),
      //     route(":aps/racks/:nr", "routes/aps/rack.tsx"),
      //     route(":aps/racks", "routes/aps/racks.tsx"),
      route(":aps/settings", "routes/aps/settings.tsx"),
      //     route(":aps/statistics", "routes/aps/statistics.tsx"),
      //     route(":aps/tags", "routes/aps/tags.tsx"),
    ]),
  ]),
  route("action/set-locale", "./routes/action.set-locale.ts"),
  route("action/set-theme", "./routes/action.set-theme.ts"),
  route("api/auth/*", "routes/api.auth.$.ts"),
  route("api/locales/:lng/:ns", "./routes/locales.ts"),
  route("*", "./routes/not-found.tsx"),
] satisfies RouteConfig;
