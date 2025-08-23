export default {
  title: "parkbot-app (it)",
  description: "Supervisione dei sistemi di parcheggio automatizzati",
  submitButton: "Invia",
  twoFA: {
    auth: {
      cardTitle: "Two-factor authentication",
      cardDescription: "Inserisci il codice OTP generato",
      codeLabel: "Codice OTP",
      recoveryLink: "Utilizza il codice di recupero",
    },
    reset: {
      cardTitle: "Recupera il tuo account",
      cardDescription: "Invia il tuo codice di recupero",
      codeLabel: "Codice di recupero",
    },
    setup: {
      cardTitle: "Set up two-factor authentication",
      cardDescription: "Inquadra il codice QR con lo smartphone",
      codeLabel: "Codice OTP",
    },
  },
  forgotPassword: {
    cardTitle: "Password dimenticata?",
    cardDescription: "Descrizione",
    loginLink: "Ritorna a",
  },
  login: {
    cardTitle: "Accedi a Parkbot",
    cardDescription: "Inserisci la tua email per accedere",
    forgotLink: "Password dimenticata?",
    signup: "Non hai un account?",
    signupLink: "Iscriviti",
    action: {
      mesgOne: "Inserisci la tua email e password",
      mesgTwo: "Campi non validi o mancanti",
      mesgThree: "Indirizzo email non valido",
      mesgFour: "Account non trovato",
      mesgFive: "Password non valida",
    },
  },
  logout: {
    cardTitle: "Disconnessione da Parkbot",
    cardDescription: "Sei sicuro di voler uscire?",
    loader: {
      mesgOne: "Non autenticato",
    },
  },
  recoveryCode: {
    cardTitle: "Codice di recupero",
    cardDescription: "Ecco il tuo codice di recupero",
    cardContent:
      "Utilizza il codice per recuperare l'accesso 2FA (secondo fattore di autenticazione)",
    nextLink: "Avanti",
  },
  signup: {
    cardTitle: "Creare un account Parkbot",
    cardDescription: `Il tuo username deve essere lungo almeno 3 caratteri e la password almeno 8 caratteri.`,
    cardContent: {
      confirmPassword: "Conferma password",
    },
    action: {
      mesgOne: "Inserisci il tuo username, email e password",
      mesgTwo: "Campi non validi o mancanti",
      mesgThree: "Indirizzo email non valido",
      mesgFour: "Indirizzo email già utilizzato",
      mesgFive: "Username non valido",
      mesgSix: "Password debole",
      mesgSeven: "La password non coincide",
    },
  },
  verifyEmail: {
    cardTitle: "Verifica il tuo indirizzo email",
    cardDescription: "Abbiamo inviato un codice a",
    codeLabel: "Codice di verifica",
    changeMailLink: "Cambia la tua email",
    resendButton: "Rinvia codice",
  },
} satisfies typeof import("~/locales/en/translation").default;
