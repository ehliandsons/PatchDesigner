import cookie from "cookie";

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const { shop, shopify_token } = cookies;

  if (!shop || !shopify_token) {
    return res.status(401).json({ authenticated: false });
  }

  res.status(200).json({
    authenticated: true,
    shop
  });
}
