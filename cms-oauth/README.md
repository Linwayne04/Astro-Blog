# Decap CMS GitHub OAuth Proxy (Cloudflare Worker)

This worker handles GitHub OAuth login for the Decap CMS admin UI hosted on Cloudflare Pages.

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

## Restrict postMessage target origin (optional but recommended)

Edit `wrangler.toml` and uncomment:

```toml
[vars]
SITE_DOMAIN = "blog.linwayne.dpdns.org"
```

Then re-deploy.

## Sources

- [sterlingwes/decap-proxy](https://github.com/sterlingwes/decap-proxy)
- [Decap CMS backends overview](https://decapcms.org/docs/backends-overview/)
