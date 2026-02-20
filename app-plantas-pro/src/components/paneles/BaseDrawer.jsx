import { FaDeleteLeft } from "react-icons/fa6";

export const BaseDrawer = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
}) => {
  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      ></div>

      <aside className={`drawer-panel ${isOpen ? "open" : ""}`}>
        {/* CABECERA */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            {Icon && <Icon size={24} />}
            <h3>{title}</h3>
          </div>
          <div onClick={onClose} className="icon-btn-close">
            <FaDeleteLeft size={32} />
          </div>
        </div>

        {/* CUERPO DEL DRAWER */}
        <div className="drawer-body">
          <div className="drawer-content-container">{children}</div>
        </div>
      </aside>

      <style>{`
        .drawer-panel {
          position: fixed;
          top: 0;
          right: -100%;
          width: 88%; /* Ancho del panel respecto a la pantalla */
          max-width: 420px;
          height: 100%;
          background: #F4F6F8; /* Un gris muy claro para resaltar las tarjetas blancas */
          z-index: 1000;
          transition: right 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          display: flex;
          flex-direction: column;
          box-shadow: -5px 0 20px rgba(0,0,0,0.15);
        }

        .drawer-panel.open {
          right: 0;
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px;
          background: white;
          border-bottom: 1px solid #E5E7EB;
        }

        .drawer-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #1E3A2B;
        }

        .drawer-header-left h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .icon-btn-close {
          color: #EF4444;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        /* CONTENEDOR DE SCROLL */
        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 0; /* Solo padding arriba y abajo */
          -webkit-overflow-scrolling: touch;
        }

        /* CONTENEDOR DE CONTENIDO (Aquí aplicamos tu 90%) */
        .drawer-content-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          gap: 20px; /* Espacio entre tarjetas */
        }

        /* ESTA REGLA ASEGURA QUE TODO LO QUE METAS MIDA 90% */
        .drawer-content-container > * {
          width: 95% !important;
          max-width: 400px;
          box-sizing: border-box;
          padding-left: 30px;
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
      `}</style>
    </>
  );
};
