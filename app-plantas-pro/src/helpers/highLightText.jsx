import React from "react";
import { normalizarParaBusqueda } from "./textHelper";

export const resaltarTexto = (texto, busqueda) => {
  if (!texto) return "";

  // VALIDACIÓN DE ADMINISTRADOR: Solo resaltar si hay 2 o más letras
  if (!busqueda || busqueda.trim().length < 2) {
    return texto;
  }

  const busquedaNorm = normalizarParaBusqueda(busqueda);
  const textoNorm = normalizarParaBusqueda(texto);

  if (!textoNorm.includes(busquedaNorm)) return texto;

  const resultado = [];
  let currentIndex = 0;

  while (currentIndex < texto.length) {
    const startIdx = textoNorm.indexOf(busquedaNorm, currentIndex);

    if (startIdx === -1) {
      resultado.push(texto.slice(currentIndex));
      break;
    }

    if (startIdx > currentIndex) {
      resultado.push(texto.slice(currentIndex, startIdx));
    }

    const endIdx = startIdx + busquedaNorm.length;
    const coincidenciaOriginal = texto.slice(startIdx, endIdx);

    resultado.push(
      <mark key={startIdx} className="resaltado-amarillo">
        {coincidenciaOriginal}
      </mark>,
    );

    currentIndex = endIdx;
  }

  return resultado;
};
