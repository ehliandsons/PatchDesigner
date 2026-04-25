import querystring from "querystring";

export default async function handler(req, res) {
  const { SHOPIFY_API_KEY, SCOPES, HOST } = process.env;
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).send("Missing shop parameter");
  }

  const redirectUri = `${HOST}/api/auth-callback`;
  const state = Math.random().toString(36).substring(2);

  const query = querystring.stringify({
    client_id: SHOPIFY_API_KEY,
    scope: SCOPES,
    redirect_uri: redirectUri,
    state,
    grant_options: ["per-user"]
  });

  const installUrl = `https://${shop}/admin/oauth/authorize?${query}`;

  res.setHeader(
    "Set-Cookie",
    `shopify_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/`
  );
  res.redirect(installUrl);
}
