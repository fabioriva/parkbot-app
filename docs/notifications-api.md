# Alarm notification API

`POST /api/notifications` accepts JSON from `parkbot-api` and sends one localized
email per recipient through SendGrid. No browser session is required.

Configure these variables on the **parkbot-app server**:

```dotenv
NOTIFICATIONS_API_TOKENS='{"daman":"replace-with-a-random-secret"}'
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_SENDER=your-verified-sender@example.com
```

Use a distinct random token for each installation. Generate a token with
`openssl rand -hex 32`. The JSON map can contain multiple installations.
The backend sends the matching token in `Authorization: Bearer <token>`;
its payload's `aps` must match the installation associated with that token.
Tokens are server configuration and must never be sent to browser clients.

Example request body, with `Content-Type: application/json`:

```json
{
  "eventId": "log-12",
  "aps": "daman",
  "recipients": [{ "email": "technician@example.com", "locale": "it" }],
  "alarmLog": {
    "operation": { "id": 1 },
    "alarm": { "id": 12, "key": "al-pn", "query": { "name": "PLC <A&B>" } },
    "device": { "id": 2, "name": "Lift 2" },
    "date": "2026-09-23T10:20:30.000Z"
  }
}
```

Example curl command to test the endpoint:

```bash
curl -i -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer replace-with-a-random-secret" \
  --data '{
    "eventId": "log-12",
    "aps": "daman",
    "recipients": [
      { "email": "technician@example.com", "locale": "it" }
    ],
    "alarmLog": {
      "operation": { "id": 1 },
      "alarm": {
        "id": 12,
        "key": "al-pn",
        "query": { "name": "PLC <A&B>" }
      },
      "device": { "id": 2, "name": "Lift 2" },
      "date": "2026-09-23T10:20:30.000Z"
    }
  }'
```

Locales are selected per recipient, with the Paraglide base locale as fallback.
Dates are displayed in UTC. Only operation `1` sends email; other operations
return `200` with `status: "ignored"` after payload validation.

Success returns `200` with `{ "eventId": "log-12", "accepted": [0], "failed": [] }`.
The arrays contain zero-based recipient indexes. Acceptance means SendGrid
accepted the request, not that the email reached the inbox.
If any send fails, the response is `502`, with accepted and failed indexes.
Only failed recipients should be considered for retry. A timeout can leave
provider acceptance uncertain.

Other responses: `400` invalid JSON/payload, `401` missing/invalid token,
`403` unauthorized installation, `405` unsupported method, `415` non-JSON body,
`500` invalid authentication configuration or unexpected processing failure.

`eventId` provides correlation only: persistent duplicate protection and a
retry queue are not implemented. The existing authentication email helper and
the PLC/backend flow are unchanged.
