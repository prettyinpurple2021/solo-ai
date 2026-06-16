# Zoho Mail SMTP — SoloSuccess AI

Transactional email (welcome, password reset, 2FA codes, invites) is sent via **Zoho Mail SMTP**, not Resend.

## 1) Create an app-specific password (Zoho Mail)

1. Log in to [Zoho Mail](https://mail.zoho.com).
2. Go to **Settings** → **Security** → **App Passwords** (wording may vary).
3. Generate a password for “SoloSuccess AI” / “Vercel”.
4. Copy it once — you will not see it again.

Use your **full Zoho email address** as the SMTP user (e.g. `support@yourdomain.com`).

## 2) SMTP settings (typical US accounts)

| Variable | Value |
| -------- | ----- |
| `SMTP_HOST` | `smtp.zoho.com` (EU: `smtp.zoho.eu`) |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` (use `true` and port `465` for SSL) |
| `SMTP_USER` | Your Zoho mailbox email |
| `SMTP_PASSWORD` | App-specific password (not your login password) |
| `FROM_EMAIL` | `SoloSuccess AI <support@yourdomain.com>` |
| `CONTACT_INBOX_EMAIL` | Same as `SMTP_USER` or a team inbox for contact form |

## 3) Add to Vercel and Railway

**Vercel** → Project → Settings → Environment Variables → add all variables above for Production (and Preview if you test email there).

**Railway** → Variables → same set if the API server sends email.

Remove obsolete **`RESEND_API_KEY`** from both dashboards after deploy.

## 4) Redeploy and test

1. Redeploy Vercel (and restart Railway if used).
2. Trigger a **2FA / login code** email or password reset on production.
3. Check Zoho **Sent** folder and the recipient inbox (and spam).

## 5) CRIT-008

- **Do not rotate** Resend — **delete/revoke** the old Resend API key in the Resend dashboard.
- No Resend entry is required in [SECRET_ROTATION_RUNBOOK.md](../reports/SECRET_ROTATION_RUNBOOK.md) once migration is live.
