// src/helpers/phoneHelper.js

export const cleanNumeric = (value) => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};

export const isValidPhone = (phone) => {
  const clean = cleanNumeric(phone);
  // Un estándar razonable: entre 9 y 15 dígitos
  return clean.length >= 9 && clean.length <= 15;
};
