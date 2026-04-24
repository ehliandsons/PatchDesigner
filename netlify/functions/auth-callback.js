// netlify/functions/auth-callback.js
const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const { code, shop, state } = event.queryStringParameters || {};

    if (!code || !shop || !state) {
      return {
        statusCode: 400,
        body: "Missing parameters"
      };
    }

    const decoded = JSON.parse(Buffer.from(state, "base64").toString("utf8"));
    const returnTo = decoded.return_to || "https://patchdesigner.netlify.app/admin/";

    const clientId = process.env.SHOPIFY_API_KEY;
    const clientSecret = process.env.SHOPIFY_API_SECRET;

    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    if (!tokenRes.ok) {
      console.error("Token exchange failed", await tokenRes.text());
      return {
        statusCode: 500,
        body: "Failed to exchange token"
      };
    }

    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;

    // In a real app, use a proper session store.
    // Here we set a signed cookie with the token + shop.
    const sessionPayload = Buffer.from(
      JSON.stringify({
        shop,
        accessToken
      })
    ).toString("base64");

    return {
      statusCode: 302,
      headers: {
        "Set-Cookie": `pd_session=${sessionPayload}; Path=/; HttpOnly; Secure; SameSite=Lax`,
        Location: returnTo
      },
      body: ""
    };
  } catch (e) {
    console.error("auth-callback error", e);
    return {
      statusCode: 500,
      body: "Internal error"
    };
  }
};
