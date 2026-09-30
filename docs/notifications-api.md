# Alarm notification API

`POST /api/notifications` accepts JSON from `parkbot-api` and sends one localized
email per recipient through SendGrid. No browser session is required.

Configure these variables on the **parkbot-app server**:

```dotenv
NOTIFICATIONS_API_TOKENS_FILE=./.secrets/notifications-tokens.json
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_SENDER=your-verified-sender@example.com
```

Create the local JSON file (one entry per installation):

```json
{
  "daman-n": "replace-with-a-random-secret",
  "agami": "replace-with-another-random-secret"
}
```

Use the installation's exact `ns` from the `aps` collection as the key.
Generate a distinct token for each installation with `openssl rand -hex 32`.
The local `.secrets/` directory is excluded from Git. Keep the token file readable
only by the server user (for example, `chmod 600` on Linux). Provision it separately
on each deployed server; it is not included in the application build.

Relative paths resolve from the server process's working directory. An absolute
path such as `/etc/parkbot/notifications-tokens.json` can be used in production.
The file is read on each authenticated request, so replacing its contents takes
effect without restarting. Use an atomic file replacement when rotating tokens.
Restart the server after changing the environment variable itself.

For compatibility, inline `NOTIFICATIONS_API_TOKENS` JSON is still supported when
no nonempty `NOTIFICATIONS_API_TOKENS_FILE` is configured. The file takes precedence
if both variables are set. An unreadable or invalid file fails authentication
processing with `500`; it never falls back to the inline map.

The backend sends the matching token in `Authorization: Bearer <token>`;
its payload's `aps` must match the installation associated with that token.
Tokens are server configuration and must never be sent to browser clients.

### Backend configuration (`parkbot-api`)

The sender and receiver must use **the same token** for each installation; do not
independently generate tokens on the backend. A backend server managing several
installations needs the entries for those installations only.

The current backend reads `NOTIFICATIONS_API_TOKENS` and selects `tokens[aps]`.
To use a JSON file there as well, its reader must support
`NOTIFICATIONS_API_TOKENS_FILE` with the same precedence rules. Setting the file
variable alone does not enable it in the current backend. Until that reader is
updated, configure the matching entries as inline JSON. `NOTIFICATIONS_URL` must
point to this app's `/api/notifications` endpoint.

Example request body, with `Content-Type: application/json`:

```json
{
  "eventId": "log-12",
  "aps": "daman-n",
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
    "aps": "daman-n",
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
