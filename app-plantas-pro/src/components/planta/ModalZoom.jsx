import { TbX } from "react-icons/tb";
import { ImagenVisor } from "./ImagenVisor";

export const ModalZoom = ({ url, onClose }) => {
  if (!url) return null;

  return (
    <div className="modal-zoom-overlay" onClick={onClose}>
      <button className="btn-cerrar-zoom" onClick={onClose}>
        <TbX size={28} />
      </button>

      {/* Evitamos que el clic en la foto cierre el modal */}
      <div className="modal-zoom-content" onClick={(e) => e.stopPropagation()}>
        <ImagenVisor url={url} esZoom={true} />
      </div>
    </div>
  );
};
