export default {
  title: "parkbot-app (en)",
  description: "The robotic parking monitoring tool",
  submitButton: "Submit",
  auth: {
    accountNotFound: "Account does not exist",
    codeInvalid: "Incorrect code",
    emailInvalid: "Invalid email address",
    emailUsed: "Email is already used",
    emptyField: "Missing field",
    keyInvalid: "Invalid key",
    passwordDiff: "Password doesn't match",
    passwordInvalid: "Invalid password",
    passwordMax: "Password too long",
    passwordMin: "Password too short",
    passwordWeak: "Weak password",
    usernameMax: "Username too long",
    usernameMin: "Username too short",
  },
  forgotPassword: {
    cardTitle: "Forgot Password",
    cardDescription:
      "We'll send you a code to your email address to verify your identity",
    loginLink: "Back to",
    sendButton: "Send code",
  },
  login: {
    cardTitle: "Login to Parkbot",
    cardDescription: "Enter your email below to login to your account",
    forgotLink: "Forgot your password?",
    signup: "Don't have an account?",
    signupLink: "Sign up",
  },
  logout: {
    cardTitle: "Logout from Parkbot",
    cardDescription: "Are you sure you want to log out?",
  },
  recoveryCode: {
    cardTitle: "Recovery code",
    cardDescription: "Copy and save the following code to a safe place",
    cardContent:
      "You can use this recovery code if you lose access to your second factors (2FA)",
    nextLink: "Next",
  },
  selectAps: {
    cardTitle: "Select a system",
    cardDescription: "Select a system to continue",
  },
  signup: {
    cardTitle: "Create a Parkbot account",
    cardDescription: `Your username must be at least 3 characters long and your password must be at least 8 characters long.`,
    confirmLabel: "Confirm password",
  },
  twoFA: {
    auth: {
      cardTitle: "Two-factor authentication",
      cardDescription: "Enter the OTP code from your authenticator app",
      codeLabel: "Verification code",
      recoveryLink: "Use recovery code",
    },
    reset: {
      cardTitle: "Recover your account",
      cardDescription: "Enter your recovery code",
      codeLabel: "Recovery code",
      orDivider: "Or use your",
    },
    setup: {
      cardTitle: "Set up two-factor authentication",
      cardDescription: "Scan the QR code with your camera",
      codeLabel: "Verification code",
    },
  },
  verifyEmail: {
    cardTitle: "Verify your email address",
    cardDescription: "We sent an 8-digit code to",
    codeLabel: "Verification code",
    changeMailLink: "Change your email",
    resendButton: "Resend code",
  },
  aps: {
    sidebar: {
      title: "Getting Started",
      menu: {
        dashboard: "Dashboard",
        devices: "Devices overview",
        map: "Parking map",
        tags: "Tags",
      },
    },
  },
};
