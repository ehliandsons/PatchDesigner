const fetch = require("node-fetch");

exports.handler = async (event) => {
  const params = event.queryStringParameters;
  const shop = params.shop;
  const code = params.code;
  const returnTo = params.state;

  const clientId = process.env.SHOPIFY_API_KEY;
  const clientSecret = process.env.SHOPIFY_API_SECRET;

  const tokenUrl = `https://${shop}/admin/oauth/access_token`;

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code
    })
  });

  const data = await res.json();

  // Store token in Netlify session cookie
  return {
    statusCode: 302,
    headers: {
      "Set-Cookie": `shop=${shop}; Path=/; HttpOnly`,
      "Set-Cookie": `token=${data.access_token}; Path=/; HttpOnly`,
      Location: returnTo
    },
    body: ""
  };
};
