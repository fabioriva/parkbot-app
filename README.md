# parkbot-app

Parkbot web service

## Features

- 🚀 React Router v7
- 🔐 Lucia based email and password authentication with 2FA
- 🌐 internationalisation with remix-i18next
- 🎉 TailwindCSS for styling
- 🔥 shadcn/ui components

## Initialize project

Create a .env file. Generate a 128 bit (16 byte) string, base64 encode it, and set it as `ENCRYPTION_KEY`.

```bash
ENCRYPTION_KEY="L9pmqRJnO1ZJSQ2svbHuBA=="
```

Use OpenSSL to quickly generate a secure key.

```bash
openssl rand --base64 16
```