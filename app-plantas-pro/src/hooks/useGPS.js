import { useState, useEffect, useCallback, useRef } from "react";

export const useGPS = () => {
  const [userCoords, setUserCoords] = useState(null);
  const [errorGPS, setErrorGPS] = useState(null);
  const isMounted = useRef(true); // Para evitar fugas de memoria

  const obtenerUbicacion = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorGPS("GPS no soportado");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMounted.current) return;
        const { latitude: lat, longitude: lon } = position.coords;

        // Usamos un callback funcional en el set para asegurar que React
        // maneje la actualización de forma asíncrona y segura
        setUserCoords(() => ({ lat, lon }));
        setErrorGPS(null);
      },
      (err) => {
        if (!isMounted.current) return;
        setErrorGPS(err.message);
        setUserCoords(null);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    isMounted.current = true;
    // Disparamos la ubicación después de que el componente se haya pintado
    const timer = setTimeout(() => {
      obtenerUbicacion();
    }, 100);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  }, [obtenerUbicacion]);

  return { userCoords, errorGPS, refrescarGPS: obtenerUbicacion };
};
