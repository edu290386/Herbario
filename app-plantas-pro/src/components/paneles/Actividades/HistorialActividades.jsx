import React from "react";
import { RegistroLog } from "../RegistroLog";

const HistorialActividades = ({ actividades, user }) => {
  return (
    <div style={{ padding: "10px" }}>
      {actividades.map((log) => (
        <RegistroLog key={log.id} log={log} userRole={user?.rol} />
      ))}
    </div>
  );
};

export default HistorialActividades;