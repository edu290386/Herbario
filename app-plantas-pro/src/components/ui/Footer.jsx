// src/components/ui/Footer.jsx
import { Copyright } from "./Copyright";

export const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <Copyright />
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    width: "100%",
    marginTop: "auto",
    paddingBottom: "2rem",
    display: "flex",
    justifyContent: "center",
    paddingTop: "30px",
  },
  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 1.2rem",
    backgroundColor: "#ffffff",
    borderRadius: "15px",
    padding: "0.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: "1px solid rgba(0, 0, 0, 0.05)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
  },
};
