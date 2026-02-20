import { useState, useEffect } from "react";
import { getLogs, processProposal } from "../../services/plantasServices";
import { RegistroLog } from "./RegistroLog";

export const PanelLogs = ({ tipo, user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const { data, error } = await getLogs(tipo);
        if (!error) setLogs(data || []);
      } catch (err) {
        console.error("Error cargando logs:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [tipo]);

  const handleAction = async (log, comando) => {
    const res = await processProposal(log, comando, user.alias);
    if (res.success) {
      setLogs((prev) =>
        prev.map((l) => (l.id === log.id ? { ...l, ...res.data } : l)),
      );
    }
  };

  const handleReview = async (log) => {
    const res = await processProposal(log, "auditado_final_admin", user.alias);
    if (res.success) {
      setLogs((prev) =>
        prev.map((l) => (l.id === log.id ? { ...l, ...res.data } : l)),
      );
    }
  };

  if (loading) return <p className="loading-text">Cargando...</p>;
  if (logs.length === 0)
    return <p className="empty-text">Sin registros recientes</p>;

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
