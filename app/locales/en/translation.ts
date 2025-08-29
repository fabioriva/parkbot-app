export default {
  title: "parkbot-app (en)",
  description: "The robotic parking monitoring tool",
  submitButton: "Submit",
  auth: {
    accountNotFound: "Account does not exist",
    emailInvalid: "Invalid email address",
    emailUsed: "Email is already used",
    emptyField: "Missing field",
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
    cardDescription: "Verify your identity using your email",
    loginLink: "Back to",
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
  signup: {
    cardTitle: "Create a Parkbot account",
    cardDescription: `Your username must be at least 3 characters long and your password must be at least 8 characters long.`,
    cardContent: {
      confirmPassword: "Confirm password",
    },
  },
  twoFA: {
    auth: {
      cardTitle: "Two-factor authentication",
      cardDescription: "Enter the OTP code from your authenticator app",
      codeLabel: "OTP code",
      recoveryLink: "Use recovery code",
    },
    reset: {
      cardTitle: "Recover your account",
      cardDescription: "Enter your recovery code",
      codeLabel: "Recovery code",
    },
    setup: {
      cardTitle: "Set up two-factor authentication",
      cardDescription: "Scan the QR code with your camera",
      codeLabel: "OTP code",
    },
  },
  verifyEmail: {
    cardTitle: "Verify your email address",
    cardDescription: "We sent an 8-digit code to",
    codeLabel: "Verification code",
    changeMailLink: "Change your email",
    resendButton: "Resend code",
  },
};
