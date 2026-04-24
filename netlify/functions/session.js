// netlify/functions/session.js
exports.handler = async (event) => {
  try {
    const cookieHeader = event.headers.cookie || event.headers.Cookie || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, v] = c.trim().split("=");
        return [k, v];
      })
    );

    const raw = cookies["pd_session"];
    if (!raw) {
      return {
        statusCode: 200,
        body: JSON.stringify({ authenticated: false })
      };
    }

    const decoded = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));

    return {
      statusCode: 200,
      body: JSON.stringify({
        authenticated: true,
        shop: decoded.shop || null
      })
    };
  } catch (e) {
    console.error("session error", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ authenticated: false, error: "Internal error" })
    };
  }
};
