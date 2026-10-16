# 🤖 Parkbot App

Interfaccia web per il monitoraggio e la gestione degli impianti di parcheggio
automatico (APS), integrata con il backend Parkbot.

## ⚙️ Funzionalità

- Dashboard con occupazione, attività recenti e stato dell’impianto.
- Mappe degli stalli e monitoraggio dei dispositivi.
- Gestione delle operazioni di ingresso e uscita.
- Consultazione dello storico e delle statistiche.
- Gestione di tessere, notifiche e utenti.
- Accesso a più impianti con autorizzazioni basate sul ruolo.
- Autenticazione con verifica email e secondo fattore.
- Interfaccia in italiano e inglese, con tema chiaro e scuro.

Le funzionalità disponibili dipendono dal ruolo e dagli impianti assegnati.

## 🔑 Accesso al servizio

I servizi Parkbot sono offerti da [Sotefin SA](https://www.sotefin.com)
e ospitati su server di proprietà della società. L’utilizzo richiede una
sottoscrizione da parte del cliente e l’abilitazione degli utenti agli impianti previsti.

La disponibilità pubblica di questo repository non include l’accesso
al servizio, ai dati o agli impianti dei clienti.

Per informazioni commerciali e attivazione, contattare [Sotefin SA](https://www.sotefin.com).

## 🛠️ Stack tecnologico

| Ambito | Tecnologie |
| --- | --- |
| Interfaccia | React 19 e TypeScript |
| Routing e rendering lato server | React Router 8 |
| Build e sviluppo | Vite |
| Stile e componenti | Tailwind CSS 4 e Base UI |
| Autenticazione | Better Auth, con supporto TOTP |
| Database | MongoDB |
| Dati e aggiornamenti in tempo reale | API HTTP, SWR e WebSocket |
| Localizzazione | Paraglide JS e Inlang |
| Invio email | SendGrid |

L’applicazione combina rendering lato server e aggiornamenti nel browser
per offrire un’interfaccia reattiva. Le connessioni WebSocket aggiornano
i dati dell’impianto in tempo reale, mentre le API HTTP gestiscono
consultazioni e comandi.

## 📚 Documentazione tecnica

- [Date, fusi orari e statistiche](docs/date-time.md)
- [API per le notifiche email](docs/notifications-api.md)
