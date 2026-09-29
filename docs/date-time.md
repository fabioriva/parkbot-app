# Date e ora nel frontend

Il contratto dello storico è descritto anche in
[parkbot-api/docs/date-time.md](https://github.com/fabioriva/parkbot-api/blob/better_auth/docs/date-time.md).

## Configurazione

Ogni documento della collection `aps` deve avere il campo IANA `timeZone`,
per esempio `Asia/Dubai`, `Asia/Kolkata`, `Europe/Rome` o `America/Los_Angeles`.
Il campo si imposta in amministrazione, nella creazione/modifica dell'impianto.
La sessione custom lo legge insieme agli altri dati dell'impianto.

Non viene applicato un fuso predefinito: `VITE_PLANT_TIMEZONE` non è più usato.
Gli impianti esistenti vanno configurati prima dell'attivazione. Se il fuso manca
o non è valido, l'app lo segnala, omette gli orari e disabilita la ricerca dello
storico; l'amministrazione rimane accessibile. Nessun documento esistente viene
modificato automaticamente.

## Storico e timestamp

- Le date selezionate sono stringhe civili `yyyy-MM-dd` dell'impianto.
- Il calendario usa Date a mezzanotte UTC solo come rappresentazione di queste
  date, senza trasformarle in istanti dell'impianto. Il giorno evidenziato come
  oggi viene dal loader, nel fuso dell'impianto.
- `buildPlantDateRangeQuery(range, timeZone)` converte la mezzanotte iniziale e
  quella successiva all'ultimo giorno in ISO UTC con `Z`. L'intervallo include
  `dateFrom` ed esclude `dateTo`; i due estremi vengono convertiti separatamente.
- Loader, filtri e paginazione condividono lo stesso intervallo. Le descrizioni
  mostrano i giorni inclusi, non il limite UTC finale escluso.
- Giorni con mezzanotte inesistente o ambigua vengono rifiutati esplicitamente:
  il form chiede di scegliere un altro intervallo.
- Storico, attività recenti e notifiche WebSocket mostrano gli
  istanti nel fuso dell'impianto con offset, distinguendo le ore ripetute.
- Timestamp senza offset o non validi sono mostrati come `—`; non si indovina
  il fuso dei dati legacy. Le email conservano il contratto UTC documentato in
  `notifications-api.md`.
- Eccezione: la diagnostica live riceve ancora da `models/Alarm.js` una data
  formattata senza offset. Questo valore rimane visibile con l'indicazione
  "fuso non specificato". Se il backend fornisce ISO con offset, il frontend
  lo converte nel fuso dell'impianto; il passaggio del backend è ancora necessario.

## Statistiche

L'endpoint `/statistics` e il riepilogo giornaliero della dashboard conservano
le convenzioni precedenti del backend. La pagina operazioni non usa il nuovo
helper dello storico: limiti e raggruppamenti MongoDB devono essere aggiornati
insieme nel backend prima di supportare i giorni dell'impianto nei grafici.

## Verifica

Con Node.js >= 22.18:

```sh
node --test test/date-time.test.mjs
npm run typecheck
npm run build
```

I test coprono quattro fusi del processo, scostamento fra giorno locale e UTC,
offset di mezz'ora, ora legale (23/25 ore), mezzanotti ambigue/inesistenti,
anno bisestile, cambio d'anno e date invalide. Non richiedono connessioni a PLC,
  backend o database.
