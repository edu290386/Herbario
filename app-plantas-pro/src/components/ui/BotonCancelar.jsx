import React from "react";
import { useNavigate } from "react-router-dom";

export const BotonCancelar = ({ texto = "CANCELAR", variante = "azul-slate-claro" }) => {
  const navigate = useNavigate();

  // variante puede ser: 'gris', 'rojo', 'bosque-oscuro', 'arena', 'azul-slate'
  return (
    <>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className={`boton-cancelar ${variante}`}
      >
        {texto}
      </button>

      <style>{`
        .boton-cancelar {
          width: 100%;
          max-width: 550px;
          height: 54px;
          border-radius: 18px;
          border: none;
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          cursor: pointer;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        /* Brillo superior idéntico al principal */
        .boton-cancelar::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 50%;
          background: linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, transparent 100%);
          border-radius: 18px 18px 0 0;
          pointer-events: none;
        }

        /* OPCIÓN 1: GRIS PIZARRA (Elegante y neutral - Recomendado) */
        .boton-cancelar.gris {
          background: linear-gradient(145deg, #94a3b8 0%, #64748b 100%);
          box-shadow: 0 6px 15px rgba(100, 116, 139, 0.25), inset 0 -3px 0 rgba(0,0,0,0.15);
        }

        /* OPCIÓN 2: ROJO CORAL (Para una cancelación clara pero estética) */
        .boton-cancelar.rojo {
          background: linear-gradient(145deg, #f87171 0%, #dc2626 100%);
          box-shadow: 0 6px 15px rgba(220, 38, 38, 0.2), inset 0 -3px 0 rgba(0,0,0,0.15);
        }

        /* OPCIÓN 3: BOSQUE PROFUNDO (Combina por analogía con el verde) */
        .boton-cancelar.bosque-oscuro {
          background: linear-gradient(145deg, #344e41 0%, #1a2e25 100%);
          box-shadow: 0 6px 15px rgba(26, 46, 37, 0.25), inset 0 -3px 0 rgba(0,0,0,0.2);
        }

        /* OPCIÓN 4: ARENA/RETAMA (Combina por contraste cálido) */
        .boton-cancelar.arena {
          background: linear-gradient(145deg, #d97706 0%, #b45309 100%);
          box-shadow: 0 6px 15px rgba(180, 83, 9, 0.2), inset 0 -3px 0 rgba(0,0,0,0.15);
        }

        /* OPCIÓN 5: AZUL SLATE OSCURO (Muy profesional/moderno) */
        .boton-cancelar.azul-slate {
          background: linear-gradient(145deg, #475569 0%, #1e293b 100%);
          box-shadow: 0 6px 15px rgba(30, 41, 59, 0.25), inset 0 -3px 0 rgba(0,0,0,0.2);
        }

        .boton-cancelar.azul-slate-claro {
          /* Usamos tonos que armonizan con el gris de tus inputs pero con más vida */
          background: linear-gradient(145deg, #708090 0%, #5d6d7e 100%);
          
          /* Sombra sutil que evita el "gris sucio" usando un tono azulado profundo */
          box-shadow: 0 6px 15px rgba(93, 109, 126, 0.25), 
                      inset 0 -3px 0 rgba(0, 0, 0, 0.15);
        }

        /* Efectos de Interacción */
        .boton-cancelar:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }

        .boton-cancelar:active:not(:disabled) {
          transform: translateY(1px);
          filter: brightness(0.9);
        }
      `}</style>
    </>
  );
};
