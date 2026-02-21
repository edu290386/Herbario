import { useState, useEffect, useRef, useCallback } from "react";

export const useGPS = () => {
  const [coords, setCoords] = useState(null);
  const [cargandoGPS, setCargandoGPS] = useState(false);
  const [errorGPS, setErrorGPS] = useState(null);
  const isMounted = useRef(true);

  const obtenerUbicacion = useCallback((esGestoUsuario = false) => {
    if (!navigator.geolocation) {
      setErrorGPS("Geolocalización no soportada");
      return;
    }

    // Limpiamos errores previos e iniciamos carga
    setErrorGPS(null);
    setCargandoGPS(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMounted.current) return;

        const nuevasCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCoords(nuevasCoords);
        setErrorGPS(null);
        setCargandoGPS(false);
      },
      (error) => {
        if (!isMounted.current) return;

        let mensajeError = "Error al obtener ubicación";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            mensajeError = "Activa el GPS y permite el acceso";
            break;
          case error.POSITION_UNAVAILABLE:
            mensajeError = "Señal GPS débil o no disponible";
            break;
          case error.TIMEOUT:
            mensajeError = "Tiempo de espera agotado";
            break;
          default:
            mensajeError = "Error desconocido";
        }

        // Si fue una violación automática (useEffect), somos discretos
        if (!esGestoUsuario) {
          console.warn("Intento de GPS automático fallido (silencioso).");
        } else {
          console.error("❌ GPS ERROR:", mensajeError);
        }

        setErrorGPS(mensajeError);
        setCargandoGPS(false);
        setCoords(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000, // Bajado a 8s para que el paso Amarillo -> Rojo sea más ágil
        maximumAge: 0,
      },
    );
  }, []);

  useEffect(() => {
    isMounted.current = true;

    // Solo se lanza automáticamente si no hay coordenadas
    // Esto evita el bucle infinito y cumple con las dependencias de React
    if (coords === null && !errorGPS && !cargandoGPS) {
      obtenerUbicacion(false);
    }

    return () => {
      isMounted.current = false;
    };
  }, [coords, errorGPS, cargandoGPS, obtenerUbicacion]);

  return {
    coords,
    cargandoGPS,
    errorGPS,
    // Forzamos que este sea el que se llame en OnClick (Gesto de usuario)
    refrescarGPS: () => obtenerUbicacion(true),
  };
};
