import { useState } from "react";
import { PiPlantFill, PiMapPinFill, PiBookOpenTextFill } from "react-icons/pi";
import { GiAfrica, GiEarthAmerica } from "react-icons/gi";
import { FaBookReader, FaChevronCircleDown } from "react-icons/fa";
import "./GuiaRegistro.css"

export const GuiaRegistro = ({ flujo }) => {
  const [abierto, setAbierto] = useState(false); // Empieza cerrado

  const configuracion = {
    "nueva planta": {
      bg: "#fdfdfd",
      border: "var(--color-frondoso)",
      icon: <FaBookReader size={25} color="#339af0" />,
      titulo: "Registro de Planta",
      pasos: [
        <>
          <strong>Nombres Locales:</strong> Los nombres cambian al cruzar la
          frontera. Si en tu país se llama <strong>Plátano (VE)</strong> o{" "}
          <strong>Banano (CO)</strong>, escríbelo y selecciona su bandera para
          ayudar a tu comunidad.
        </>,
        <>
          <strong>Nombre Internacional:</strong> ¿Es un nombre universal o no
          estás seguro del país exacto? Usa la opción <strong>Global</strong>.
          Es ideal para términos como <strong>Banana</strong> que se usan en
          todo el mundo.
        </>,
        <>
          <strong>Nombres Yoruba</strong> Honramos el conocimiento litúrgico.
          Para nombres con carga espiritual como{" "}
          <em style={{ color: "#856404" }}>Ewé Ògèdè</em>, selecciona{" "}
          <strong>Yoruba</strong>.
        </>,
        <>
          <strong>Sistema de Calidad (Anti-Duplicados):</strong> Nuestra base de
          datos no permite registros duplicados. Si el sistema bloquea tu
          registro y crees que es un error,{" "}
          <strong>contacta al administrador</strong> para evaluar tu caso.
        </>,
        <>
          <strong>Foto de Referencia:</strong> Sube una imagen
          clara y bien iluminada. Esta foto es la que permite al{" "}
          <strong>Administrador</strong> validar la especie, identificar sus
          detalles técnicos y aprobar tu registro con total seguridad.
        </>,
      ],
    },
    "solo ubicacion": {
      bg: "#fdfdfd",
      border: "#339af0", // Azul informativo
      icon: <FaBookReader size={25} color="#339af0" />,
      titulo: "Capturar Ubicación",
      pasos: [
        <>
          <strong>Requisitos Técnicos:</strong> Es obligatorio permitir el
          acceso al <strong>GPS</strong>. Asegúrate de que los indicadores de
          Foto y GPS se marquen en verde para finalizar.
        </>,
        <>
          <strong>Foto de Referencia:</strong> No tomes solo la planta; incluye
          objetos cercanos (banca, reja o casa) que sirvan de{" "}
          <strong>punto de referencia</strong> para que otros la encuentren.
        </>,

        /* 2. REGLAS DE CAMPO (Evita errores de registro) */
        <>
          <strong>Regla de Proximidad:</strong> No puedes registrar la{" "}
          <strong>misma planta</strong> a menos de 40 metros de su punto
          anterior. Entre 40 y 100 metros, el sistema te avisará para que
          decidas si es un nuevo ejemplar.
        </>,
        <>
          <strong>Biodiversidad:</strong> Si en el mismo punto hay una{" "}
          <strong>especie diferente</strong>, puedes registrarla sin ninguna
          restricción de distancia.
        </>,

        /* 3. PRIVACIDAD Y GRUPO (Confianza y colaboración) */
        <>
          <strong>Privacidad Grupal:</strong> Tu ubicación es privada y{" "}
          <strong>recíproca</strong>: solo la compartes con tu grupo, y a
          cambio, tú ves los puntos que ellos registren.
        </>,
        <>
          <strong>Valor del Mapeo:</strong> Más ubicaciones significan un mapa
          más fuerte para <strong>identificar zonas de crecimiento</strong> y
          localizar ejemplares eficientemente.
        </>,

        /* 4. SOPORTE (Plan B) */
        <>
          <strong>¿Sin señal?:</strong> Si el GPS falla, toma una captura de la
          ubicación y la foto, y <strong>envíalas al administrador</strong> para
          un registro manual.
        </>,
      ],
    },
    "agregar detalle": {
      bg: "#fdfdfd",
      border: "#845ef7",
      icon: <PiPlantFill size={26} color="#845ef7" />,
      titulo: "Mejorar Información",
      pasos: [
        "Añade variantes de nombres y fotos de alta calidad.",
        "Tu contribución ayuda a la comunidad a identificar mejor esta especie.",
      ],
    },
  };

  const info = configuracion[flujo];
  if (!info) return null;

  return (
    <div className={`guia-container-new ${abierto ? "guia-abierta" : ""}`}>
      <div
        className="guia-header-new"
        onClick={() => setAbierto(!abierto)}
        style={{ cursor: "pointer" }}
      >
        <div className="guia-titulo-wrapper">
          {info.icon}
          <span className="guia-titulo-new">{info.titulo}</span>
        </div>

        <div className={`guia-toggle-box ${abierto ? "abierto" : ""}`}>
          <span className="guia-toggle-text">
            {abierto ? "Cerrar" : "Indicaciones"}
          </span>
          <FaChevronCircleDown className="guia-icon-anim" size={14} color={"#339af0"}/>
        </div>
      </div>

      {/* WRAPPER PARA LA SUAVIZACIÓN (Sin el condicional {abierto && ...}) */}
      <div className={`guia-acordeon-wrapper ${abierto ? "expandido" : ""}`}>
        <div className="guia-content-inner">
          <ul className="guia-lista-new">
            {info.pasos.map((paso, index) => (
              <li key={index} className="guia-item-new">
                <div
                  className="guia-bullet"
                  style={{ backgroundColor: info.border }}
                />
                <div className="guia-texto-paso">{paso}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};