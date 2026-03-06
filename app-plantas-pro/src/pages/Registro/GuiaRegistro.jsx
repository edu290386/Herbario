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
        /* 1. NOMBRES LOCALES */
        <>
          <strong>Nombres Locales:</strong> Los nombres cambian al cruzar la
          frontera. Si en tu país se llama <strong>Plátano (VE)</strong> o{" "}
          <strong>Banano (CO)</strong>, escríbelo y selecciona su bandera para
          ayudar a tu comunidad.
        </>,

        /* 2. NOMBRE INTERNACIONAL */
        <>
          <strong>Nombre Internacional:</strong> ¿Es un nombre universal o no
          estás seguro del país exacto? Usa la opción <strong>Global</strong>.
          Es ideal para términos como <strong>Banana</strong> que se usan en
          todo el mundo.
        </>,

        /* 3. NOMBRES YORUBA */
        <>
          <strong>Nombres Yoruba:</strong> Honramos el conocimiento litúrgico.
          Para nombres con carga espiritual como{" "}
          <em style={{ color: "#856404" }}>Ewé Ògèdè</em>, selecciona{" "}
          <strong>Yoruba</strong>.
        </>,

        /* 4. SISTEMA DE CALIDAD (ANTI-DUPLICADOS) */
        <>
          <strong>Sistema de Calidad:</strong> Nuestra base de datos no permite
          registros duplicados. Si el sistema bloquea tu registro y crees que es
          un error, <strong>contacta al administrador</strong> para evaluar tu
          caso.
        </>,

        /* 5. AUTONOMÍA Y REVISIÓN (NUEVO PASO) */
        <>
          <strong>Registro Inmediato:</strong> Para no obstaculizar tu trabajo,
          te permitimos crear la planta <strong>sin supervisión inicial</strong>
          . Sin embargo, tras una revisión técnica, la información podría sufrir{" "}
          <strong>cambios o modificaciones</strong> por parte del administrador
          para garantizar la exactitud del herbario.
        </>,

        /* 6. FOTO DE REFERENCIA */
        <>
          <strong>Foto de Referencia:</strong> Sube una imagen clara y bien
          iluminada. Esta foto es la que permite al{" "}
          <strong>Administrador</strong> validar la especie e identificar sus
          detalles técnicos con total seguridad.
        </>,
      ],
    },
    "nueva ubicacion": {
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
    "nueva imagen": {
      bg: "#fdfdfd",
      border: "#339af0", // Azul informativo
      icon: <FaBookReader size={25} color="#339af0" />,
      titulo: "Aporte de imágenes",
      pasos: [
        /* 1. CALIDAD Y FORMATO */
        <>
          <strong>Requisitos Visuales:</strong> Las imágenes deben estar{" "}
          <strong>nítidas y bien enfocadas</strong>. Si subes fotos desde tu{" "}
          <strong>galería</strong>, asegúrate de que tengan una resolución
          estándar y que los detalles botánicos sean visibles.
        </>,
        <>
          <strong>Formato y Visor Real:</strong> El formato{" "}
          <strong>ideal es 3:4 (vertical)</strong>. Si utilizas{" "}
          <strong>9:16 (formato historia)</strong>, la imagen también sirve,
          pero el sistema realizará un <strong>recorte automático</strong>. Es{" "}
          <strong>vital</strong> que te guíes por el visor, ya que es un{" "}
          <strong>reflejo fiel</strong> de cómo se verá la foto en la galería
          pública.
        </>,

        /* 2. CLASIFICACIÓN */
        <>
          <strong>Etiquetado Obligatorio:</strong> Para procesar tu aporte, es
          indispensable <strong>seleccionar una etiqueta</strong> (hoja, tallo,
          flor, etc.) que represente fielmente la imagen. Esto permite que el
          sistema organice la información correctamente.
        </>,

        /* 3. LÍMITES Y CARRUSEL */
        <>
          <strong>Organización por Categorías:</strong> El sistema agrupa las
          fotos en un <strong>carrusel dinámico</strong>. Aunque existe una
          limitación preferente de <strong>3 fotos por categoría</strong>, si
          tienes material excepcional, puedes enviarlo para enriquecer la ficha.
        </>,

        /* 4. REVISIÓN Y ESTADO */
        <>
          <strong>Validación de Staff:</strong> Todo contenido subido será{" "}
          <strong>revisado por los administradores</strong> antes de ser
          público. Una vez des el "OK" final, la imagen entrará en cola de
          aprobación.
        </>,

        /* 5. SOPORTE */
        <>
          <strong>¿Problemas con la subida?:</strong> Si el sistema rechaza tu
          archivo o tienes dudas sobre la calidad técnica,{" "}
          <strong>contacta al administrador</strong> para recibir asistencia en
          tu reporte.
        </>,
      ],
    },
    "nuevo nombre": {
      bg: "#fdfdfd",
      border: "#339af0",
      icon: <FaBookReader size={25} color="#339af0" />,
      titulo: "Sugerir Nombre",
      pasos: [
        /* 1. NOMBRES LOCALES (Tu texto) */
        <>
          <strong>Nombres Locales:</strong> Los nombres cambian al cruzar la
          frontera. Si en tu país se llama <strong>Plátano (VE)</strong> o{" "}
          <strong>Banano (CO)</strong>, escríbelo y selecciona su bandera para
          ayudar a tu comunidad.
        </>,

        /* 2. NOMBRE INTERNACIONAL (Tu texto) */
        <>
          <strong>Nombre Internacional:</strong> ¿Es un nombre universal o no
          estás seguro del país exacto? Usa la opción <strong>Global</strong>.
          Es ideal para términos como <strong>Banana</strong> que se usan en
          todo el mundo.
        </>,

        /* 3. NOMBRES YORUBA (Tu texto) */
        <>
          <strong>Nombres Yoruba:</strong> Honramos el conocimiento litúrgico.
          Para nombres con carga espiritual como{" "}
          <em style={{ color: "#856404" }}>Ewé Ògèdè</em>, selecciona{" "}
          <strong>Yoruba</strong>.
        </>,

        /* 4. REQUISITOS Y DUPLICADOS */
        <>
          <strong>Requisitos de Registro:</strong> Para sugerir un nombre es
          obligatorio <strong>escribir el término</strong> y seleccionar su{" "}
          <strong>procedencia</strong>. En este apartado{" "}
          <strong>sí se permiten duplicados</strong>, ya que un mismo nombre
          puede pertenecer a diferentes países o tradiciones.
        </>,

        /* 5. REVISIÓN Y SOPORTE */
        <>
          <strong>Auditoría y Soporte:</strong> Todo nombre sugerido será{" "}
          <strong>revisado por el administrador</strong> antes de publicarse
          oficialmente. Si encuentras algún inconveniente o error durante el
          proceso, <strong>contacta al administrador</strong> para recibir ayuda
          técnica.
        </>,
      ],
    },
    "nuevo comentario": {
      bg: "#fdfdfd",
      border: "#f59e0b", // Naranja para resaltar que es información dinámica
      icon: <FaBookReader size={25} color="#339af0" />,
      titulo: "Saberes y Sugerencias",
      pasos: [
        /* 1. CONOCIMIENTO Y PROPIEDADES */
        <>
          <strong>Saberes y Propiedades:</strong> Este es el espacio para
          compartir <strong>usos tradicionales, propiedades medicinales</strong>{" "}
          o curiosidades botánicas. Tu conocimiento ayuda a que otros entiendan
          mejor el valor de cada especie.
        </>,

        /* 2. INSTRUCCIONES DE MANEJO */
        <>
          <strong>Guía de Cultivo:</strong> ¿Sabes cómo tratar con esta planta?
          Puedes aportar{" "}
          <strong>instrucciones de siembra, riego o cosecha</strong>. Compartir
          el manejo técnico asegura que la comunidad sepa cuidar los ejemplares
          de forma correcta.
        </>,

        /* 3. CORRECCIONES Y QUEJAS */
        <>
          <strong>Mejora Continua:</strong> Si detectas un error en la ficha,
          una descripción incorrecta o tienes una{" "}
          <strong>queja o sugerencia técnica</strong>, infórmalo aquí. Usamos
          tus reportes para realizar <strong>correcciones inmediatas</strong> en
          el herbario.
        </>,

        /* 4. REQUISITOS DE CALIDAD */
        <>
          <strong>Aporte Valioso:</strong> Para garantizar la calidad, el texto
          debe tener al menos <strong>10 caracteres</strong> para ser enviado. Sé claro y conciso para facilitar la lectura de otros usuarios.
        </>,

        /* 5. AUDITORÍA Y MODIFICACIÓN */
        <>
          <strong>Revisión Administrativa:</strong> Al igual que todo el sistema, tu comentario será{" "}<strong>revisado por un administrador</strong>. Nos reservamos el derecho de <strong>editar o modificar</strong> el texto para corregir ortografía o precisión técnica antes de su publicación.
        </>,

        /* 6. SOPORTE DIRECTO */
        <>
          <strong>Contacto de Apoyo:</strong> Si tienes un problema grave con el
          registro o una duda que no encaja aquí,{" "}
          <strong>contacta directamente al administrador</strong> para recibir
          asistencia personalizada.
        </>,
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