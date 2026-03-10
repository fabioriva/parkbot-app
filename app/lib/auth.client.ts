import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react
// import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    // twoFactorClient({
    //   onTwoFactorRedirect() {
    //     // Handle the 2FA verification globally
    //     console.log("2FA redirect");
    //   },
    // }),
  ],
});
