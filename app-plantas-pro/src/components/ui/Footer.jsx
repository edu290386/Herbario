import { TbCloverFilled } from "react-icons/tb";
import { FaRegCopyright } from "react-icons/fa";
import { colores } from "../../constants/tema";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <TbCloverFilled style={styles.logo} />
          <span style={styles.brandText}>Ile Merin Adde SAC</span>
        </div>

        <div style={styles.info}>
          <p style={styles.copyright}>
            <FaRegCopyright color={colores.bosque} /> {year} • Todos los
            derechos reservados
          </p>
          <p style={styles.copyright}> Herbolario v2.3</p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    width: "100%",
    marginTop: "auto",
    paddingBottom: "2rem", // Espacio al final de la pantalla
    display: "flex",
    justifyContent: "center", // Centra el container si la pantalla es muy ancha
    paddingTop:"30px",
  },
  container: {
    // ESTA ES LA CLAVE DE LA SIMETRÍA:
    width: "100%",
    maxWidth: "1200px", // Exactamente igual al home-layout-container
    margin: "0 1.2rem", // Margen lateral para pantallas pequeñas (mobile)

    backgroundColor: "#ffffff",
    borderRadius: "15px",
    padding: "0.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    border: "1px solid rgba(0, 0, 0, 0.05)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  logo: {
    color: "var(--color-frondoso)",
    fontSize: "1.3rem",
  },
  brandText: {
    fontWeight: "700",
    color: "var(--color-carbon)",
    fontSize: "0.9rem",
    letterSpacing: "-0.5px",
  },
  info: {
    textAlign: "center",
  },
  copyright: {
    fontSize: "0.8rem",
    color: "#666",
    margin: 0,
  },
  version: {
    fontSize: "0.65rem",
    color: "#ccc",
    margin: "0.1rem 0 0 0",
    fontWeight: "bold",
  },
};
