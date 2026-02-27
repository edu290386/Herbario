export const getCleanHardwareName = () => {
  const ua = navigator.userAgent;
  const platform = navigator.platform;

  // 1. LÓGICA ESPECÍFICA PARA APPLE (Para que no se mezclen)
  const esIPad =
    /iPad/i.test(ua) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const esIPhone = /iPhone/i.test(ua);

  if (esIPhone) return "Apple iPhone";
  if (esIPad) return "Apple iPad";

  // 2. LÓGICA PARA ANDROID (Marcas específicas)
  if (/Android/i.test(ua)) {
    if (/Samsung/i.test(ua)) return "Samsung Android";
    if (/Xiaomi|Redmi|POCO/i.test(ua)) return "Xiaomi Android";
    if (/Motorola|Moto/i.test(ua)) return "Motorola Android";
    if (/Huawei/i.test(ua)) return "Huawei Android";
    if (/Honor/i.test(ua)) return "Honor Android";
    if (/Realme/i.test(ua)) return "Realme Android";
    if (/Vivo/i.test(ua)) return "Vivo Android";
    if (/Oppo/i.test(ua)) return "Oppo Android";
    return "Celular Android";
  }

  // 3. LÓGICA PARA WINDOWS
  if (/Win/i.test(platform) || /Windows/i.test(ua)) {
    if (/Windows NT 10.0/i.test(ua)) return "Windows 10/11";
    if (/Windows NT 6.1/i.test(ua)) return "Windows 7";
    return "Laptop Windows";
  }

  // 4. OTROS
  if (/Mac/i.test(platform)) return "MacBook / iMac";
  if (/Linux/i.test(platform)) return "Computadora Linux";

  return "Dispositivo Genérico";
};

export const detectarTipoCampo = () => {
  const ua = navigator.userAgent;
  const platform = navigator.platform;

  const esAppleMobile =
    /iPhone|iPad/i.test(ua) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const esAndroid = /Android/i.test(ua);

  return esAppleMobile || esAndroid ? "id_movil" : "id_laptop";
};
