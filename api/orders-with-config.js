import cookie from "cookie";
import fetch from "node-fetch";

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const { shop, shopify_token } = cookies;

  if (!shop || !shopify_token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const url = `https://${shop}/admin/api/2024-01/orders.json?status=any&fields=id,name,line_items,created_at`;

  const shopifyRes = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": shopify_token,
      "Content-Type": "application/json"
    }
  });

  if (!shopifyRes.ok) {
    const text = await shopifyRes.text();
    return res.status(500).json({ error: "Shopify API error", detail: text });
  }

  const data = await shopifyRes.json();

  const ordersWithConfig = data.orders
    .map(order => {
      const items = order.line_items || [];
      const withConfig = items.filter(li =>
        (li.properties || []).some(p => p.name === "Patch Config JSON")
      );
      if (!withConfig.length) return null;
      return {
        id: order.id,
        name: order.name,
        created_at: order.created_at,
        line_items: withConfig
      };
    })
    .filter(Boolean);

  res.status(200).json({ orders: ordersWithConfig });
}
