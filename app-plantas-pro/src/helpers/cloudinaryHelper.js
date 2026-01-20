const CLOUD_NAME = "dk9faaztd"; // Reemplaza con tu Cloud Name de Cloudinary
const UPLOAD_PRESET = "plantas_preset"; // Reemplaza con tu Upload Preset (debe ser 'unsigned')

/**
 * Sube una imagen directamente a Cloudinary
 * @param {File} file - El archivo de imagen capturado por la cámara o galería
 * @returns {Promise<string>} - La URL de la imagen subida
 */
export const uploadImage = async (file) => {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Error al subir imagen a Cloudinary");
    }

    const data = await response.json();
    return data.secure_url; // Esta es la URL que guardaremos en Supabase
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};


export const transformarImagen = (url, modo = "card") => {
  if (!url) return "";

  // CONFIGURACIÓN PARA DETALLE (CARRUSEL)
  if (modo === "detalle") {
    return url.replace(
      "/upload/",
      // w_1080, h_1350 -> Relación 4:5 (universal para móvil/laptop)
      // c_fill -> Llena el espacio sin deformar
      // g_auto -> Inteligencia Artificial para no cortar la flor/fruto
      "/upload/ar_3:4,c_fill,g_auto,w_1600,f_auto,q_auto/",
    );
  }

  // CONFIGURACIÓN PARA HOME (LISTADO)
  return url.replace(
    "/upload/",
    "/upload/w_500,h_500,c_fill,g_auto,f_auto,q_auto/",
  );
};
