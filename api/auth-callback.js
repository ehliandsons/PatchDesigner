import crypto from "crypto";
import querystring from "querystring";
import fetch from "node-fetch";
import cookie from "cookie";

export default async function handler(req, res) {
  const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, HOST } = process.env;
  const { shop, hmac, code, state } = req.query;

  if (!shop || !hmac || !code || !state) {
    return res.status(400).send("Missing required parameters");
  }

  const cookies = cookie.parse(req.headers.cookie || "");
  if (!cookies.shopify_state || cookies.shopify_state !== state) {
    return res.status(400).send("Invalid state");
  }

  const params = { ...req.query };
  delete params.hmac;
  const message = querystring.stringify(params);
  const providedHmac = Buffer.from(hmac, "utf-8");
  const generatedHash = Buffer.from(
    crypto.createHmac("sha256", SHOPIFY_API_SECRET).update(message).digest("hex"),
    "utf-8"
  );

  if (!crypto.timingSafeEqual(generatedHash, providedHmac)) {
    return res.status(400).send("HMAC validation failed");
  }

  const tokenUrl = `https://${shop}/admin/oauth/access_token`;
  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code
    })
  });

  if (!tokenRes.ok) {
    return res.status(500).send("Failed to exchange token");
  }

  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token;

  res.setHeader("Set-Cookie", [
    `shop=${shop}; HttpOnly; Secure; SameSite=Lax; Path=/`,
    `shopify_token=${accessToken}; HttpOnly; Secure; SameSite=Lax; Path=/`
  ]);

  res.redirect(`${HOST}/admin/`);
}
