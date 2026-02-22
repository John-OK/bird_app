import { useState, useEffect, useRef } from "react";
import axios from "axios";

function useUserLocation() {
  const [position, setPosition] = useState(null);
  const [positionSource, setPositionSource] = useState("unknown");
  const [locationStatus, setLocationStatus] = useState("pending");
  const [locationMessage, setLocationMessage] = useState(
    "Determining your location...",
  );

  const hasPosition = useRef(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        hasPosition.current = true;
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setPositionSource("precise");
        setLocationStatus("success");
        setLocationMessage("Location determined");
      },
      (error) => {
        console.error("Geolocation error:", error);

        if (!hasPosition.current) {
          axios
            .get("/geolocate/")
            .then((response) => {
              if (response.data.coords && response.data.coords.length === 2) {
                setPosition(response.data.coords);
                setPositionSource("coarse");
                setLocationStatus("success");
                setLocationMessage("Location determined via IP");
              } else {
                throw new Error("Invalid coords format from backend");
              }
            })
            .catch((err) => {
              console.error("IP geolocation failed:", err);
              setLocationStatus("error");
              setLocationMessage("Unable to determine location");
            });
        }
      },
    );
  }, []);

  const isSearchEnabled =
    positionSource === "precise" || positionSource === "coarse";

  return {
    position,
    positionSource,
    locationStatus,
    locationMessage,
    isSearchEnabled,
  };
}

export default useUserLocation;
