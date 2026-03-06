import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient"; // Ajusta esta ruta a tu proyecto
import { RegistroLog } from "./RegistroLog";

export const PanelLogs = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("logs")
          .select("*")
          // FILTRO ESTRICTO: Solo lo que pediste
          .in("tipo_accion", ["nueva_planta", "nueva_ubicacion"])
          .order("created_at", { ascending: false });

        if (!error) setLogs(data || []);
      } catch (err) {
        console.error("Error cargando logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
        Sincronizando bitácora...
      </div>
    );
  if (logs.length === 0)
    return (
      <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
        Sin registros recientes.
      </div>
    );

  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#f8fafc",
        height: "100%",
        overflowY: "auto",
      }}
    >
      {logs.map((log) => (
        <RegistroLog key={log.id} log={log} userRole={user?.rol} />
      ))}
    </div>
  );
};