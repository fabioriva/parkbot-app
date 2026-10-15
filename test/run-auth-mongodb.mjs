// Explicit opt-in keeps ordinary test discovery from connecting to a server.
process.env.AUTH_MONGODB_INTEGRATION = "1"
// Cookie security defaults are selected when Better Auth modules are imported.
// Validate the production configuration, with both services using HTTPS cookies.
process.env.NODE_ENV = "production"
await import("./auth-mongodb.integration.test.mjs")
