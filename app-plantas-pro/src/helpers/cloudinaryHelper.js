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
  // 1. SEGURO TOTAL: Si no es un string, devolvemos vacío y evitamos el crash
  if (!url || typeof url !== "string") return "";

  // 2. SEGURO DE FORMATO: Si la URL no es de Cloudinary, la devolvemos tal cual
  if (!url.includes("/upload/")) return url;

  try {
    // CONFIGURACIÓN PARA DETALLE (CARRUSEL)
    if (modo === "detalle") {
      return url.replace(
        "/upload/",
        "/upload/ar_3:4,c_fill,g_auto,w_1200,f_auto,q_auto/",
      );
    }

    // CONFIGURACIÓN PARA HOME (LISTADO)
    return url.replace(
      "/upload/",
      "/upload/w_500,h_700,c_fill,g_auto,f_auto,q_auto/",
    );
  } catch (error) {
    // Si algo falla en el replace, devolvemos la URL original para no romper la app
    console.error("Error en transformarImagen:", error);
    return url;
  }
};
