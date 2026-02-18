export const uploadImage = async (file, folderPath) => {
  if (!file) return null;

  // 1. Configuración de Cloudinary (Usa variables de entorno por seguridad)
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const URL_API = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  // 2. Preparación de los datos (FormData)
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  // Como administrador, forzamos la estructura de carpetas
  formData.append("folder", folderPath);

  try {
    const respuesta = await fetch(URL_API, {
      method: "POST",
      body: formData,
    });

    if (!respuesta.ok) {
      const errorData = await respuesta.json();
      throw new Error(
        errorData.error?.message || "Error al subir a Cloudinary",
      );
    }

    const data = await respuesta.json();

    // Retornamos la URL segura (HTTPS)
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Service Error:", error);
    throw error; // Re-lanzamos para que RegistroPlantaPage lo capture en su try/catch
  }
};
