const fetch = require("node-fetch");

exports.handler = async (event) => {
  const cookies = event.headers.cookie || "";
  const shop = cookies.match(/shop=([^;]+)/)?.[1];
  const token = cookies.match(/token=([^;]+)/)?.[1];

  if (!shop || !token) {
    return { statusCode: 401, body: "Not logged in" };
  }

  const url =
    `https://${shop}/admin/api/2024-01/orders.json?status=any&fields=id,name,customer,line_items,created_at`;

  const res = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json"
    }
  });

  const data = await res.json();

  const filtered = data.orders.filter(order =>
    order.line_items.some(item =>
      (item.properties || []).some(p => p.name === "Patch Config JSON")
    )
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ orders: filtered })
  };
};
