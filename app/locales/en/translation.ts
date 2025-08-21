export default {
  title: "parkbot-app (en)",
  description: "The robotic parking monitoring tool",
  submitButton: "Submit",
  twoFA: {
    auth: {
      cardTitle: "Two-factor authentication",
      cardDescription: "Enter the OTP code from your authenticator app",
      codeLabel: "OTP code",
      recoveryLink: "Use recovery code",
    },
    setup: {
      cardTitle: "Set up two-factor authentication",
      cardDescription: "Scan the QR code with your camera",
    },
  },
  forgotPassword: {
    cardTitle: "Forgot Password",
    cardDescription: "Description",
    loginLink: "Back to",
  },
  login: {
    cardTitle: "Login to Parkbot",
    cardDescription: "Enter your email below to login to your account",
    forgotLink: "Forgot your password?",
    signup: "Don't have an account?",
    signupLink: "Sign up",
    action: {
      mesgOne: "Please enter your email and password",
      mesgTwo: "Invalid or missing fields",
      mesgThree: "Invalid email address",
      mesgFour: "Account does not exist",
      mesgFive: "Invalid password",
    },
  },
  logout: {
    cardTitle: "Logout from Parkbot",
    cardDescription: "Are you sure you want to log out?",
    loader: {
      mesgOne: "Not authenticated",
    },
  },
  signup: {
    cardTitle: "Create a Parkbot account",
    cardDescription: `Your username must be at least 3 characters long and your password must be at least 8 characters long.`,
    cardContent: {
      confirmPassword: "Confirm password",
    },
    action: {
      mesgOne: "Please enter your username, email and password",
      mesgTwo: "Invalid or missing fields",
      mesgThree: "Invalid email address",
      mesgFour: "Email is already used",
      mesgFive: "Invalid username",
      mesgSix: "Weak password",
      mesgSeven: "Password doesn't match",
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
