export default {
  title: "parkbot-app (it)",
  description: "Supervisione dei sistemi di parcheggio automatizzati",
  submitButton: "Invia",
  auth: {
    accountNotFound: "Account non trovato",
    codeInvalid: "Codice non valido",
    emailInvalid: "Indirizzo email non valido",
    emailUsed: "Indirizzo email già utilizzato",
    emptyField: "Campo mancante",
    keyInvalid: "Chiave di cifratura non valida",
    passwordDiff: "La password non coincide",
    passwordInvalid: "Password non valida",
    passwordMax: "Password troppo lunga",
    passwordMin: "Password troppo corta",
    passwordWeak: "Password debole",
    usernameMax: "Username troppo lungo",
    usernameMin: "Username troppo corto",
  },
  forgotPassword: {
    cardTitle: "Password dimenticata?",
    cardDescription:
      "Invieremo un codice al tuo indirizzo email per verificare la tua identità",
    loginLink: "Ritorna alla pagina di ",
    sendButton: "Invia codice",
  },
  login: {
    cardTitle: "Accedi a Parkbot",
    cardDescription: "Inserisci la tua email per accedere",
    forgotLink: "Password dimenticata?",
    signup: "Non hai un account?",
    signupLink: "Iscriviti",
  },
  logout: {
    cardTitle: "Disconnessione da Parkbot",
    cardDescription: "Sei sicuro di voler uscire?",
  },
  recoveryCode: {
    cardTitle: "Codice di recupero",
    cardDescription: "Copia il codice e salvalo in un luogo sicuro",
    cardContent:
      "Utilizza il codice per recuperare l'accesso 2FA (secondo fattore di autenticazione)",
    nextLink: "Avanti",
  },
  selectAps: {
    cardTitle: "Seleziona un sistema",
    cardDescription: "Seleziona un sistema per continuare",
  },
  signup: {
    cardTitle: "Creare un account Parkbot",
    cardDescription: `Il tuo username deve essere lungo almeno 3 caratteri e la password almeno 8 caratteri.`,
    confirmLabel: "Conferma password",
  },
  twoFA: {
    auth: {
      cardTitle: "Two-factor authentication",
      cardDescription: "Inserisci il codice OTP generato",
      codeLabel: "Codice di verifica",
      recoveryLink: "Utilizza il codice di recupero",
    },
    reset: {
      cardTitle: "Recupera il tuo account",
      cardDescription: "Invia il tuo codice di recupero",
      codeLabel: "Codice di recupero",
      orDivider: "Oppure utilizza il tuo",
    },
    setup: {
      cardTitle: "Set up two-factor authentication",
      cardDescription: "Inquadra il codice QR con lo smartphone",
      codeLabel: "Codice di verifica",
    },
  },
  verifyEmail: {
    cardTitle: "Verifica il tuo indirizzo email",
    cardDescription: "Abbiamo inviato un codice a",
    codeLabel: "Codice di verifica",
    changeMailLink: "Cambia la tua email",
    resendButton: "Invia codice",
  },
  aps: {
    sidebar: {
      title: "Inizia",
      menu: {
        dashboard: "Pannello di controllo",
        devices: "Vista dispositivi",
        map: "Posti auto",
      },
    },
  },
} satisfies typeof import("~/locales/en/translation").default;
