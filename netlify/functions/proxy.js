const SCRIPT_URL = "https://script.google.com/macros/library/d/1AbdvteLRYn_RIMmcUBear1eREIyZhGgVs6SZUvvhGizOgeLeSIjSHC5r/6";

exports.handler = async function (event) {

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  try {
    if (event.httpMethod === "GET") {
      const response = await fetch(SCRIPT_URL, { redirect: "follow" });
      const text = await response.text();
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: text,
      };
    }

    if (event.httpMethod === "POST") {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: event.body,
        redirect: "follow",
      });
      const text = await response.text();
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: text,
      };
    }

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, message: err.message }),
    };
  }
};
