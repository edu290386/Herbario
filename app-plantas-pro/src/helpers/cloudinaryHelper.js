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
export const transformarImagen = (url, modo = "detalle") => {
  if (!url || typeof url !== "string") return "";
  if (!url.includes("/upload/")) return url;

  try {
    // 1. CARDS: 400px (Rápido)
    if (modo === "card") {
      return url.replace("/upload/", "/upload/w_400,c_scale,f_auto,q_auto/");
    }

    // 2. DETALLE CARRUSEL: 1000px (Calidad de visualización)
    if (modo === "detalle" || modo === "detalle_base") {
      return url.replace("/upload/", "/upload/w_1000,c_scale,f_auto,q_auto/");
    }

    // 3. ZOOM MÁXIMO: 1600px (Como pediste, detalle total)
    if (modo === "detalle_zoom") {
      return url.replace("/upload/", "/upload/w_1600,c_scale,f_auto,q_auto/");
    }
    return url;
  } catch (error) {
    console.error("Error en transformarImagen:", error);
    return url;
  }
};