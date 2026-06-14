export interface Env {
	GITHUB_CLIENT_ID: string;
	GITHUB_CLIENT_SECRET: string;
	SITE_DOMAIN?: string;
}

const cookieName = "__Host-oauth_state";

function getCookieValue(header: string | null, name: string): string | undefined {
	if (!header) return undefined;
	const match = header
		.split(";")
		.map((c) => c.trim())
		.find((c) => c.startsWith(`${name}=`));
	return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// 1. Start GitHub OAuth flow
		if (url.pathname === "/auth") {
			const state = crypto.randomUUID();
			const githubUrl = new URL("https://github.com/login/oauth/authorize");
			githubUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
			githubUrl.searchParams.set("scope", "repo");
			githubUrl.searchParams.set("state", state);

			return new Response(null, {
				status: 302,
				headers: {
					Location: githubUrl.toString(),
					"Set-Cookie": `${cookieName}=${state}; Max-Age=600; Path=/; HttpOnly; Secure; SameSite=Lax`,
				},
			});
		}

		// 2. Handle GitHub callback
		if (url.pathname === "/callback") {
			const code = url.searchParams.get("code");
			const returnedState = url.searchParams.get("state");
			const savedState = getCookieValue(request.headers.get("Cookie"), cookieName);

			if (!returnedState || !savedState || returnedState !== savedState) {
				return new Response("Invalid or missing state", { status: 403 });
			}
			if (!code) {
				return new Response("Missing authorization code", { status: 400 });
			}

			const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					client_id: env.GITHUB_CLIENT_ID,
					client_secret: env.GITHUB_CLIENT_SECRET,
					code,
				}),
			});

			const tokenData = (await tokenRes.json()) as { access_token?: string };
			if (!tokenData.access_token) {
				return new Response("GitHub token exchange failed", { status: 401 });
			}

			const targetOrigin = env.SITE_DOMAIN ? `https://${env.SITE_DOMAIN}` : "*";
			const payload = JSON.stringify({
				token: tokenData.access_token,
				provider: "github",
			});

			const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>GitHub Authorization</title></head>
<body>
<script>
(function() {
  var payload = ${JSON.stringify(payload)};
  var targetOrigin = ${JSON.stringify(targetOrigin)};
  window.opener.postMessage("authorization:github:success:" + payload, targetOrigin);
})();
</script>
<p>Authorization complete. You can close this window.</p>
</body>
</html>`;

			return new Response(html, {
				status: 200,
				headers: {
					"Content-Type": "text/html",
					"Set-Cookie": `${cookieName}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`,
				},
			});
		}

		return new Response("Decap CMS GitHub OAuth proxy", { status: 200 });
	},
};
