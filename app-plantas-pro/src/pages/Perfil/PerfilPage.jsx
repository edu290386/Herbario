import { useState, useContext } from "react";
import {
  FaCcVisa,
  FaApplePay,
  FaCcPaypal,
  FaGooglePay,
  FaCcDinersClub,
  FaPauseCircle,
  FaCrown,
  FaRegCreditCard,
  FaWhatsapp,
  FaSignOutAlt,
  FaUsers,
  FaMapMarkedAlt,
  FaRoute,
  FaCamera,
  FaLeaf,
} from "react-icons/fa";
import { FaCcMastercard } from "react-icons/fa6";
import { IoIosLock } from "react-icons/io";
import { SiMaildotru } from "react-icons/si";
import { AuthContext } from "../../context/AuthContext";
import { formatearFechaLocal } from "../../helpers/timeHelper";
import "./PerfilPage.css";

export const PerfilPage = ({ user }) => {

  
  const { logout } = useContext(AuthContext);
  // Estado inicial en el plan de 30 días
  const [planSeleccionado, setPlanSeleccionado] = useState(30);

  // Array de planes para renderizar el carrusel fácilmente
  const planes = [
    { dias: 30, nombre: "1 Mes", precio: "30.00" },
    { dias: 60, nombre: "2 Meses", precio: "55.00" },
    { dias: 90, nombre: "3 Meses", precio: "80.00", badge: "Popular" },
    { dias: 180, nombre: "6 Meses", precio: "150.00" },
    { dias: 365, nombre: "1 Año", precio: "280.00", badge: "Ahorra 20%" },
  ];

  return (
    <div className="perfil-forest-centered">
      <div className="master-card-forest">
        {/* HEADER HORIZONTAL */}
        <div className="vip-header-row">
          <div className="vip-avatar-container">
            <div className="vip-avatar">
              {user?.nombre?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="vip-lock-badge">
              <IoIosLock />
            </div>
          </div>
          <div className="vip-user-info">
            <h2>
              {user?.nombre} {user?.apellido}
            </h2>
            <span className="vip-alias">
              <SiMaildotru
                style={{ fontSize: "0.75rem", marginRight: "4px" }}
              />
              {user?.alias || "socio_activo"}
            </span>
            <div className="vip-status-pill">
              <FaPauseCircle /> Pausado
            </div>
          </div>
        </div>

        {/* CUERPO DE LA TARJETA */}
        <div className="vip-body-content">
          <div className="vip-welcome-msg">
            <p>
              Tu acceso premium finalizó el{" "}
              <strong>{formatearFechaLocal(user?.suscripcion_vence)}</strong>.
              Renueva hoy para seguir trabajando en equipo, porque{" "}
              <b>la unión hace la fuerza</b> <FaLeaf className="leaf-icon" />.
            </p>
          </div>

          <div className="vip-benefits-box">
            <h4>
              <FaCrown className="crown-icon" /> Experiencia Premium
            </h4>
            <div className="benefits-list">
              <BenefitRow icon={<FaUsers />} text="Colaboración grupal" />
              <BenefitRow
                icon={<FaMapMarkedAlt />}
                text="Geolocalización exacta"
              />
              <BenefitRow icon={<FaRoute />} text="Rutas optimizadas" />
              <BenefitRow icon={<FaCamera />} text="Galería técnica HD" />
            </div>
          </div>

          <div className="vip-checkout-box">
            <h4>
              <FaRegCreditCard /> Selecciona tu plan
            </h4>

            {/* CARRUSEL DE PLANES */}
            <div className="plans-carousel-wrapper">
              <div className="plans-carousel-track">
                {/* Renderizamos la lista DOS VECES para el efecto de bucle infinito */}
                {[...planes, ...planes].map((plan, index) => (
                  <div
                    key={`${plan.dias}-${index}`} // Clave única para React
                    className={`plan-item ${planSeleccionado === plan.dias ? "active" : ""}`}
                    onClick={() => setPlanSeleccionado(plan.dias)}
                  >
                    {plan.badge && (
                      <div className="save-badge">{plan.badge}</div>
                    )}
                    <span>{plan.nombre}</span>
                    <p>S/ {plan.precio}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-forest-pay">
              <IoIosLock size={18} /> RENOVAR SUSCRIPCIÓN
            </button>
            <button
              className="btn-forest-wa"
              onClick={() => window.open("https://wa.me/TUNUMERO", "_blank")}
            >
              <FaWhatsapp size={16} /> Coordinar por WhatsApp
            </button>

            <div className="gateway-icons-row">
              <FaCcVisa />
              <FaCcMastercard />
              <FaCcDinersClub />
              <FaCcPaypal />
              <FaApplePay />
              <FaGooglePay />
            </div>
          </div>

          <button onClick={logout} className="btn-vip-logout">
            <FaSignOutAlt /> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

const BenefitRow = ({ icon, text }) => (
  <div className="benefit-row-mini">
    <div className="benefit-icon-mini">{icon}</div>
    <span>{text}</span>
  </div>
);
