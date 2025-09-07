// netlify/functions/removebg.js
export async function handler(event) {
  // CORS erlauben
  const cors = {
    "Access-Control-Allow-Origin": "*",   // für Produktivbetrieb auf deine Domain einschränken
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors };
  }

  try {
    const contentType =
      event.headers["content-type"] ||
      event.headers["Content-Type"] ||
      "application/octet-stream";

    // Body korrekt dekodieren (Netlify liefert Base64 bei Binärdaten)
    const body = event.isBase64Encoded
      ? Buffer.from(event.body, "base64")
      : event.body;

    // Anfrage an remove.bg weiterleiten – der Key kommt aus Netlify Env
    const resp = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVEBG_API_KEY,
        "Content-Type": contentType
      },
      body
    });

    const buf = Buffer.from(await resp.arrayBuffer());

    return {
      statusCode: resp.status,
      headers: {
        ...cors,
        "Content-Type": resp.headers.get("content-type") || "image/png",
        "Cache-Control": "no-store"
      },
      body: buf.toString("base64"),
      isBase64Encoded: true
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: err.message })
    };
  }
}
