import { useEffect } from "react"; // 1. Añadimos useEffect
import { FaDeleteLeft } from "react-icons/fa6";

export const BaseDrawer = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
}) => {
  // 2. BLOQUEO DE SCROLL DEL BODY
  useEffect(() => {
    if (isOpen) {
      // Bloqueo total para iOS y Android
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // Restaurar posición al cerrar
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
  }, [isOpen]);

  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      ></div>

      <aside className={`drawer-panel ${isOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-header-left">
            {Icon && <Icon size={24} />}
            <h3>{title}</h3>
          </div>
          <div onClick={onClose} className="icon-btn-close">
            <FaDeleteLeft size={30} />
          </div>
        </div>

        <div className="drawer-body">
          <div className="drawer-content-container">{children}</div>
        </div>
      </aside>

      <style>{`
        .drawer-panel {
          position: fixed;
          top: 0;
          right: -100%;
          width: 100%; /* Por defecto 100% para móvil */
          max-width: 400px; /* EN ESCRITORIO NO PASARÁ DE AQUÍ */
          height: 100%;
          background: #F4F6F8;
          z-index: 1000;
          transition: right 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          display: flex;
          flex-direction: column;
          box-shadow: -10px 0 30px rgba(0,0,0,0.1);
        }

        .drawer-panel.open {
          right: 0;
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          /* Aumentamos el padding superior para despegarlo del borde */
          padding: 60px 20px 20px 20px; 
          background: white;
          border-bottom: 1px solid #E5E7EB;
          padding-top: calc(env(safe-area-inset-top, 0px) + 20px);
        }

        .drawer-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #1E3A2B;
        }

        .drawer-header-left h3 {
          margin: 0;
          font-size: 1.4rem; /* Un pelín más grande para que se vea importante */
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .icon-btn-close {
          color: #EF4444;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 0;
          /* Evita rebotes raros en iOS */
          overscroll-behavior: contain; 
          -webkit-overflow-scrolling: touch;
        }

        .drawer-content-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          gap: 20px;
        }

        .drawer-content-container > * {
          width: 92% !important;
          box-sizing: border-box;
        }

        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          opacity: 0;
          visibility: hidden;
          transition: 0.3s;
          z-index: 999;
        }

        .drawer-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        /* AJUSTE PARA PANTALLAS GRANDES */
        @media (min-width: 768px) {
          .drawer-panel {
            width: 400px; /* Ancho fijo y elegante en escritorio */
          }
        }
      `}</style>
    </>
  );
};
