import { IoCloseOutline } from "react-icons/io5";

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
        <div className="drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {Icon && <Icon size={26} />}
            <h3 style={{ margin: 0 }}>{title}</h3>
          </div>
          <button onClick={onClose} className="icon-btn-close">
            <IoCloseOutline size={30} />
          </button>
        </div>

        <div className="drawer-body">{children}</div>
      </aside>
    </>
  );
};
