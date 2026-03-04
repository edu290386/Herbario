import { useState } from "react";
import { TbPlus, TbTrash, TbWorld, TbSticker } from "react-icons/tb";
import { colores } from "../../constants/tema";

// Lista de países sugerida (puedes ampliarla)
const PAISES = [
  { id: "world", label: "🌍 Global / Común", icono: <TbWorld /> },
  { id: "yoruba", label: "✨ Sagrado (Yoruba)", icono: <TbSticker /> },
  { id: "PE", label: "🇵🇪 Perú" },
  { id: "VE", label: "🇻🇪 Venezuela" },
  { id: "CO", label: "🇨🇴 Colombia" },
  { id: "CU", label: "🇨🇺 Cuba" },
  { id: "MX", label: "🇲🇽 México" },
];

export const SelectorNombres = ({
  onChange,
  nombresIniciales = [],
  esStaff = false,
}) => {
  const [listaNombres, setListaNombres] = useState(nombresIniciales);
  const [paisSel, setPaisSel] = useState("world");
  const [inputNombre, setInputNombre] = useState("");

  const agregarNombre = () => {
    if (!inputNombre.trim()) return;

    const nuevoNombreObj = {
      texto: inputNombre.trim(),
      verificado: esStaff, // Si es staff entra verificado
      autor: esStaff ? "staff" : "comunidad",
      votos: 0,
    };

    let nuevaLista = [...listaNombres];
    const indicePais = nuevaLista.findIndex((item) => item.pais === paisSel);

    if (indicePais > -1) {
      // Si el país ya existe en la lista, añadimos el nombre a ese país
      nuevaLista[indicePais].nombres.push(nuevoNombreObj);
    } else {
      // Si el país no existe, creamos el bloque del país
      nuevaLista.push({
        pais: paisSel,
        nombres: [nuevoNombreObj],
      });
    }

    setListaNombres(nuevaLista);
    setInputNombre("");
    onChange(nuevaLista); // Notificamos al formulario padre
  };

  const eliminarNombre = (codigoPais, nombreTexto) => {
    const nuevaLista = listaNombres
      .map((item) => {
        if (item.pais === codigoPais) {
          return {
            ...item,
            nombres: item.nombres.filter((n) => n.texto !== nombreTexto),
          };
        }
        return item;
      })
      .filter((item) => item.nombres.length > 0); // Eliminamos el país si queda vacío

    setListaNombres(nuevaLista);
    onChange(nuevaLista);
  };

  return (
    <div style={styles.container}>
      <p style={styles.label}>Nombres según País/Origen</p>

      <div style={styles.inputRow}>
        <select
          value={paisSel}
          onChange={(e) => setPaisSel(e.target.value)}
          style={styles.select}
        >
          {PAISES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={inputNombre}
          onChange={(e) => setInputNombre(e.target.value)}
          placeholder="Ej: Cayena"
          style={styles.input}
          onKeyPress={(e) => e.key === "Enter" && agregarNombre()}
        />

        <button onClick={agregarNombre} style={styles.btnAdd}>
          <TbPlus size={20} />
        </button>
      </div>

      {/* RENDER DE LA LISTA TEMPORAL */}
      <div style={styles.lista}>
        {listaNombres.map((bloque) => (
          <div key={bloque.pais} style={styles.bloquePais}>
            <span style={styles.badgePais}>
              {PAISES.find((p) => p.id === bloque.pais)?.label.split(" ")[0]}{" "}
              {bloque.pais}
            </span>
            <div style={styles.nombresContainer}>
              {bloque.nombres.map((n, idx) => (
                <div key={idx} style={styles.pildoraNombre}>
                  <span
                    style={{ color: n.verificado ? colores.bosque : "#666" }}
                  >
                    {n.texto} {!n.verificado && "⏳"}
                  </span>
                  <button
                    onClick={() => eliminarNombre(bloque.pais, n.texto)}
                    style={styles.btnDelete}
                  >
                    <TbTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { marginBottom: "20px", width: "100%" },
  label: {
    fontSize: "14px",
    fontWeight: "bold",
    color: colores.bosque,
    marginBottom: "8px",
  },
  inputRow: { display: "flex", gap: "8px", marginBottom: "15px" },
  select: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  input: {
    flex: 2,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  btnAdd: {
    backgroundColor: colores.frondoso,
    color: "white",
    border: "none",
    borderRadius: "8px",
    width: "45px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  lista: { display: "flex", flexDirection: "column", gap: "10px" },
  bloquePais: {
    backgroundColor: "#f0f2f0",
    padding: "10px",
    borderRadius: "10px",
    borderLeft: `4px solid ${colores.frondoso}`,
  },
  badgePais: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "#666",
    marginBottom: "5px",
    display: "block",
  },
  nombresContainer: { display: "flex", flexWrap: "wrap", gap: "6px" },
  pildoraNombre: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    backgroundColor: "white",
    padding: "4px 10px",
    borderRadius: "15px",
    border: "1px solid #ddd",
    fontSize: "13px",
  },
  btnDelete: {
    border: "none",
    background: "none",
    color: "#ff4d4d",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
};
