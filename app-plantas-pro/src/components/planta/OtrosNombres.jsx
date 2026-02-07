import { resaltarTexto } from "../../helpers/highLightText";

export const OtrosNombres = ({ lista , busqueda}) => {
  if (!lista || lista.length <= 1) return null;

  const nombresSecundarios = lista.slice(1);

  return (
    <>
      <strong className="otros-nombres-label">Otros Nombres: </strong>
      <span className="otros-nombres-texto">
        {nombresSecundarios.map((nombre, i) => (
          <span key={i}>
            {resaltarTexto(nombre.trim(), busqueda)}
            {i < nombresSecundarios.length - 1 ? ", " : ""}
          </span>
        ))}
      </span>
    </>
  );
};
