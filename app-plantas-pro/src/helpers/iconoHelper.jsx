import React from "react";

export const IconosMapas = {
  
  waze: (
    <svg
      viewBox="0 0 40 40"
      width="22"
      height="22"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fondo Celeste Redondeado */}
      <rect width="40" height="40" rx="8" fill="#33CCFF" />

      {/* Cuerpo del fantasma (Blanco con borde Negro) */}
      <path
        d="M29 23.5c0 4.7-3.8 8.5-8.5 8.5s-8.5-3.8-8.5-8.5 3.8-8.5 8.5-8.5 8.5 3.8 8.5 8.5z"
        fill="white"
        stroke="black"
        strokeWidth="1.5"
      />

      {/* Ruedas/Ojos (Negros) */}
      <circle cx="17.5" cy="23.5" r="1.5" fill="black" />
      <circle cx="23.5" cy="23.5" r="1.5" fill="black" />

      {/* El "rabito" o antena del fantasma */}
      <path
        d="M20.5 15v-2"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
};