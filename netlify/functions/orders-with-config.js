// netlify/functions/orders-with-config.js
const fetch = require("node-fetch");

function parseSession(event) {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, v] = c.trim().split("=");
      return [k, v];
    })
  );
  const raw = cookies["pd_session"];
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

exports.handler = async (event) => {
  try {
    const session = parseSession(event);
    if (!session || !session.accessToken || !session.shop) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Not authenticated" })
      };
    }

    const shop = session.shop;
    const accessToken = session.accessToken;

    // Fetch recent orders (adjust status/limit as needed)
    const res = await fetch(
      `https://${shop}/admin/api/2024-01/orders.json?status=any&limit=100`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json"
        }
      }
    );

    if (!res.ok) {
      console.error("Shopify orders error", await res.text());
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to fetch orders" })
      };
    }

    const data = await res.json();
    const orders = (data.orders || []).filter((order) =>
      order.line_items?.some((item) =>
        (item.properties || []).some(
          (p) => p.name === "Patch Config JSON" && p.value
        )
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ orders })
    };
  } catch (e) {
    console.error("orders-with-config error", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal error" })
    };
  }
};
