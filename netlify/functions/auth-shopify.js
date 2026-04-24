// netlify/functions/auth-shopify.js
const querystring = require("querystring");

exports.handler = async (event) => {
  try {
    const { shop, return_to } = event.queryStringParameters || {};

    if (!shop) {
      return {
        statusCode: 400,
        body: "Missing shop parameter"
      };
    }

    const clientId = process.env.SHOPIFY_API_KEY;
    const redirectUri = process.env.SHOPIFY_REDIRECT_URI; // e.g. https://patchdesigner.netlify.app/.netlify/functions/auth-callback
    const scopes = [
      "read_orders",
      "read_customers",
      "read_products"
    ].join(",");

    const state = Buffer.from(
      JSON.stringify({
        shop,
        return_to: return_to || "https://patchdesigner.netlify.app/admin/"
      })
    ).toString("base64");

    const params = querystring.stringify({
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      state
    });

    const redirectUrl = `https://${shop}/admin/oauth/authorize?${params}`;

    return {
      statusCode: 302,
      headers: {
        Location: redirectUrl
      },
      body: ""
    };
  } catch (e) {
    console.error("auth-shopify error", e);
    return {
      statusCode: 500,
      body: "Internal error"
    };
  }
};
