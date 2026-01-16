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


export const transformarImagen = (url) => {
  if (!url) return null;
  // Reemplaza la extensión .heic por .jpg y añade optimización automática
  return url.replace(
    "/upload/",
    "/upload/f_auto,q_auto,w_600,h_600,c_fill,g_auto/"
  );
};
