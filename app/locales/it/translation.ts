export default {
  title: "parkbot-app (it)",
  description: "Supervisione dei sistemi di parcheggio automatizzati",
  forgotPassword: {
    cardTitle: "Password dimenticata?",
    cardDescription: "Description",
    login: "Accedi",
  },
  login: {
    cardTitle: "Accedi a Parkbot",
    cardDescription: "Inserisci la tua email per accedere",
    forgotLink: "Password dimenticata?",
    signupLink: "Non hai un account?",
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
    submitButton: "Invia",
  },
} satisfies typeof import("~/locales/en/translation").default;
