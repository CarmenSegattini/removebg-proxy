// netlify/functions/removeBg.js
export default async (req, context) => {
  try {
    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), { status: 400 });
    }

    const apiKey = process.env.REMOVEBG_API_KEY; // liegt später bei Netlify
    const resp = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: (() => {
        const formData = new FormData();
        formData.append("image_file_b64", imageBase64);
        formData.append("size", "auto");
        return formData;
      })(),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(JSON.stringify({ error: errText }), { status: resp.status });
    }

    const arrayBuffer = await resp.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return new Response(JSON.stringify({ imageBase64: `data:image/png;base64,${base64}` }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
