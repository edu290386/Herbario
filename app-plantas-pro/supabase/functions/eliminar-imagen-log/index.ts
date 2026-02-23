const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // 1. Log de conexión inicial


  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { publicId } = await req.json();

    // 2. Log del ID que llega desde React
  

    if (!publicId) {
      throw new Error("No se proporcionó el publicId");
    }

    const cloudName = "dk9faaztd";
    const apiKey = "828649715931899";
    const apiSecret = "C39C8j4YXm0GokVIS5Q66NMREUA";

    const timestamp = Math.round(new Date().getTime() / 1000);
    const str = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;

    // 3. Log de la firma
    const msgUint8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    console.log("🔑 Firma generada correctamente");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    // 4. Log antes de llamar a Cloudinary
    console.log("🚀 Enviando solicitud de borrado a Cloudinary...");

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      { method: "POST", body: formData },
    );

    const cloudData = await cloudRes.json();

    // 5. Log de la respuesta final de Cloudinary
    console.log("✨ Respuesta de Cloudinary:", JSON.stringify(cloudData));

    return new Response(
      JSON.stringify({
        success: cloudData.result === "ok",
        cloudData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: any) {
    const mensajeError = error instanceof Error ? error.message : String(error);
    console.error("🚨 ERROR CRÍTICO:", mensajeError);

    return new Response(
      JSON.stringify({
        error: "Error interno",
        mensaje: mensajeError,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Forzamos 200 para que React pueda leer el JSON del error
      },
    );
  }
});
