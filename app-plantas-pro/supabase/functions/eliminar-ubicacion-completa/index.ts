// supabase/functions/eliminar-ubicacion-completa/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Manejo de CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { ubiId, publicId } = await req.json();

    // 1. ELIMINAR DE CLOUDINARY
    if (publicId) {
      const cloudName = "dk9faaztd";
      const apiKey = "828649715931899";
      const apiSecret = "C39C8j4YXm0GokVIS5Q66NMREUA";

      const timestamp = Math.round(new Date().getTime() / 1000);
      const str = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const msgUint8 = new TextEncoder().encode(str);
      const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("api_key", apiKey!);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        {
          method: "POST",
          body: formData,
        },
      );
    }

    // 2. ELIMINAR DE SUPABASE (Usando Fetch directo para evitar errores de módulo)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const dbRes = await fetch(
      `${supabaseUrl}/rest/v1/ubicaciones?id=eq.${ubiId}`,
      {
        method: "DELETE",
        headers: {
          apikey: supabaseKey!,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!dbRes.ok) throw new Error("Error al eliminar en base de datos");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
