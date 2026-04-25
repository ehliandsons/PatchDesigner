// api/save-config.js
import cookie from "cookie";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = cookie.parse(req.headers.cookie || "");
  const { shop, shopify_token } = cookies;

  if (!shop || !shopify_token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { order_id, line_item_id, config_json } = req.body || {};
  if (!order_id || !line_item_id || !config_json) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const metafieldPayload = {
    metafield: {
      namespace: "patchdesigner",
      key: `config_${line_item_id}`,
      type: "json",
      value: config_json
    }
  };

  const url = `https://${shop}/admin/api/2024-01/orders/${order_id}/metafields.json`;

  const shopifyRes = await fetch(url, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": shopify_token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(metafieldPayload)
  });

  if (!shopifyRes.ok) {
    const text = await shopifyRes.text();
    return res.status(500).json({ error: "Shopify API error", detail: text });
  }

  const data = await shopifyRes.json();
  res.status(200).json({ success: true, metafield: data.metafield });
}
