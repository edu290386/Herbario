export const transformarImagen = (url) => {
  if (!url) return null;
  // Reemplaza la extensión .heic por .jpg y añade optimización automática
  return url.replace(
    '/upload/', 
    '/upload/f_auto,q_auto,w_600,h_600,c_fill,g_auto/'
  );
};