exports.handler = async (event) => {
  const cookies = event.headers.cookie || "";
  const shop = cookies.match(/shop=([^;]+)/)?.[1];
  const token = cookies.match(/token=([^;]+)/)?.[1];

  return {
    statusCode: 200,
    body: JSON.stringify({ shop, token })
  };
};
