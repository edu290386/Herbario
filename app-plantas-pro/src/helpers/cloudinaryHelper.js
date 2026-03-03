const CLOUD_NAME = "dk9faaztd";
const UPLOAD_PRESET = "plantas_preset";

/**
 * Sube una imagen directamente a Cloudinary
 */
export const uploadImage = async (file, path) => {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", path || "otros_registros");

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error Cloudinary:", errorData);
      return null;
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

/**
 * Transforma la URL de Cloudinary de forma segura
 */
export const transformarImagen = (url, modo = "card") => {
  if (!url || typeof url !== "string") return "";
  if (!url.includes("/upload/")) return url;

  try {
    // --- NUEVAS ESTRATEGIAS PARA DETALLE ---

    // 1. VISOR BASE: Buena calidad, peso controlado (aprox w_800)
    if (modo === "detalle_base") {
      return url.replace(
        "/upload/",
        "/upload/ar_3:4,c_fill,g_auto,w_800,f_auto,q_auto/",
      );
    }

    // 2. ZOOM EXPLÍCITO: Alta calidad solo bajo demanda (aprox w_1200)
    if (modo === "detalle_zoom") {
      return url.replace(
        "/upload/",
        "/upload/ar_3:4,c_fill,g_auto,w_1200,f_auto,q_auto/",
      );
    }

    // --- ESTRATEGIAS EXISTENTES ---
    // (Mantenemos la de 'card' para el Home)
    return url.replace(
      "/upload/",
      "/upload/w_500,h_700,c_fill,g_auto,f_auto,q_auto/",
    );
  } catch (error) {
    console.error("Error en transformarImagen:", error);
    return url;
  }
};