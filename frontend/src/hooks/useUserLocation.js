import { useState, useEffect } from "react";

function useUserLocation() {
  const [position, setPosition] = useState(null);
  const [positionSource, setPositionSource] = useState("unknown");
  const [locationStatus, setLocationStatus] = useState("pending");
  const [locationMessage, setLocationMessage] = useState(
    "Determining your location...",
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setPositionSource("precise");
        setLocationStatus("success");
        setLocationMessage("Location determined");
      },
      (error) => {
        console.error("Geolocation error:", error);

        fetch("/geolocate/")
          .then((response) => response.json())
          .then((data) => {
            setPosition([data.latitude, data.longitude]);
            setPositionSource("coarse");
            setLocationStatus("success");
            setLocationMessage("Location determined via IP");
          })
          .catch((err) => {
            console.error("IP geolocation failed", err);
            setLocationStatus("error");
            setLocationMessage("Unable to determine location");
          });
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
