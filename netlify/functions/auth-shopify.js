exports.handler = async (event) => {
  const params = event.queryStringParameters;
  const returnTo = params.return_to || "";
  const shop = params.shop;

  if (!shop) {
    return {
      statusCode: 400,
      body: "Missing ?shop=yourstore.myshopify.com"
    };
  }

  const clientId = process.env.SHOPIFY_API_KEY;
  const redirectUri = `${process.env.BASE_URL}/.netlify/functions/auth-callback`;

  const authUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${clientId}` +
    `&scope=read_orders,read_customers` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(returnTo)}`;

  return {
    statusCode: 302,
    headers: { Location: authUrl },
    body: ""
  };
};
