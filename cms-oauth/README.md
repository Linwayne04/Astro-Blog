# Decap CMS GitHub OAuth Proxy (Cloudflare Worker)

This worker handles the GitHub OAuth handshake for the Decap CMS admin UI.

It implements the required two-step `postMessage` protocol:

1. `/auth` redirects the user to GitHub.
2. `/callback` receives the authorization code, exchanges it for an access token, and sends the token back to the Decap CMS parent window via `window.opener.postMessage`.

## Deploy

```bash
cd cms-oauth
npx wrangler login
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler deploy
```

## GitHub OAuth App settings

- Homepage URL: `https://blog.linwayne.dpdns.org`
- Authorization callback URL: `https://fuwari-cms-oauth.YOUR_ACCOUNT.workers.dev/callback`

## Sources

- [sterlingwes/decap-proxy](https://github.com/sterlingwes/decap-proxy)
- [Decap CMS backends overview](https://decapcms.org/docs/backends-overview/)
