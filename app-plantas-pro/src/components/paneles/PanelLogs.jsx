import { useState, useEffect } from "react";
// 1. Cambiamos la importación al nuevo servicio de aportes
import {
  resolverAporte,
  obtenerBandejaAportes,
} from "../../services/aportesServices";
import { RegistroLog } from "./RegistroLog";

export const PanelLogs = ({ tipo, user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        // 2. Usamos el nuevo lector que trae el JOIN con la tabla aportes
        // 'tipo' suele ser 'gestion' o 'actividades'
        const { data, error } = await obtenerBandejaAportes(user, tipo);
        if (!error) setLogs(data || []);
      } catch (err) {
        console.error("Error cargando logs:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) cargarDatos();
  }, [tipo, user]);

  // 3. NUEVA FUNCIÓN PARA APROBAR / RECHAZAR
  const handleAction = async (log, comando) => {
    // Traducimos el comando del botón al lenguaje del nuevo servicio
    const accion =
      comando === "filtro_operativo_aprobar" ? "aprobar" : "rechazar";

    try {
      const res = await resolverAporte({
        logId: log.id,
        plantaId: log.planta_id,
        accion: accion,
        tipoAporte: log.tipo_accion,
        contenidoJSON: log.aportes?.[0]?.contenido || null, // Pasamos el JSON limpio
        revisorAlias: user.alias,
      });

      if (res.success) {
        // Actualizamos la UI localmente para mostrar el cambio de estado
        setLogs((prev) =>
          prev.map((l) =>
            l.id === log.id
              ? {
                  ...l,
                  revisado: accion === "aprobar" ? "aprobado" : "rechazado",
                  revisado_por: user.alias,
                }
              : l,
          ),
        );
      }
    } catch (error) {
      console.error("Error al procesar aporte:", error);
      alert("No se pudo procesar el aporte.");
    }
  };

  // 4. FUNCIÓN DE AUDITORÍA (Mantenida por compatibilidad)
  const handleReview = async (log) => {
    // Aquí podrías usar una lógica similar a handleAction si decides que
    // la auditoría también use el nuevo servicio.
    console.log("Auditando log:", log.id);
  };

  if (loading)
    return (
      <p
        className="loading-text"
        style={{ textAlign: "center", padding: "20px" }}
      >
        Cargando registros...
      </p>
    );
  if (logs.length === 0)
    return (
      <p
        className="empty-text"
        style={{ textAlign: "center", padding: "20px" }}
      >
        Sin registros pendientes
      </p>
    );

  return (
    <>
      {logs.map((log) => (
        <RegistroLog
          key={log.id}
          log={log}
          userRole={user?.rol}
          panelType={tipo}
          onAction={handleAction}
          onReview={handleReview}
        />
      ))}
    </>
  );
};
