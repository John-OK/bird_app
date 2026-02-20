import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Popup,
  Marker,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import userPin from "../assets/icons/icons8-pin-64.png";
import crane from "../assets/icons/icons8-crane-bird-50.png";
import binos from "../assets/icons/icons8-binoculars-80.png";
import axios from "axios";

const userIcon = new L.icon({
  iconUrl: userPin,
  iconSize: [100, 100],
  iconAnchor: [50, 93],
  popupAnchor: [0, -80],
});

const craneIcon = new L.icon({
  iconUrl: crane,
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [6, -49],
});

const binosIcon = new L.icon({
  iconUrl: binos,
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -12],
});

function BirdMap(props) {
  const IMAGE_SEARCH_URL = "https://search.brave.com/images?q=";

  const confirmBird = function (event) {
    event.preventDefault();
    const birdToConfirm = {};

    props.birdData.forEach((bird) => {
      if (bird.id === event.target.value) {
        birdToConfirm.user = props.user;
        birdToConfirm.bird_name = bird.en;
        birdToConfirm.user_lat = props.position[0];
        birdToConfirm.user_lng = props.position[1];
        birdToConfirm.data = JSON.stringify(bird);
        // JSON.parse(object to parse) to unstringify

        console.log("sending the below data to server:");
        console.log(birdToConfirm);
      }
    });
    axios.post("/confirm_bird/", birdToConfirm).then((response) => {
      console.log("bird_confirm response from server: ", response);
    });
  };

  const url = `https://tile.openstreetmap.org/{z}/{x}/{y}.png`;
  // `https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=${import.meta.env.VITE_THUNDER_FOREST_API_KEY}`
  // `https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=${import.meta.env.VITE_THUNDER_FOREST_API_KEY}`
  // `https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=${import.meta.env.VITE_THUNDER_FOREST_API_KEY}`
  // `https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=${import.meta.env.VITE_THUNDER_FOREST_API_KEY}`
  // `https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=${import.meta.env.VITE_THUNDER_FOREST_API_KEY}`
  // `https://{s}.tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey=${import.meta.env.VITE_THUNDER_FOREST_API_KEY}`
  // `https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey=${import.meta.env.VITE_THUNDER_FOREST_API_KEY}`
  // `https://{s}.tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=${import.meta.env.VITE_THUNDER_FOREST_API_KEY}`
  // `https://{s}.tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=${import.meta.env.VITE_THUNDER_FOREST_API_KEY}`
  // `https://{s}.tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=${import.meta.env.VITE_THUNDER_FOREST_API_KEY}`
  // `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}`

  function FlyToLocation({ position }) {
    const map = useMap();
    const hasFlownTo = useRef(false);

    useEffect(() => {
      // Only fly to position if it's not the default fallback [12.5, 12.5]
      const isDefaultPosition =
        position && position[0] === 12.5 && position[1] === 12.5;

      if (position && !hasFlownTo.current && !isDefaultPosition) {
        map.flyTo(position, 9, {
          animate: true,
          duration: 1.5,
        });
        hasFlownTo.current = true;
      }
    }, [position, map]);

    return null;
  }

  return (
    <div>
      <MapContainer className="map" center={[12.5, 12.5]} zoom={3}>
        <FlyToLocation position={props.position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={url}
        />

        {/* Only show user marker when we have a real position (not default fallback) */}
        {props.position &&
          !(props.position[0] === 12.5 && props.position[1] === 12.5) && (
            <Marker position={props.position} icon={userIcon}>
              <Popup>
                <h6>
                  Your location <br />
                </h6>
              </Popup>
            </Marker>
          )}

        {props.birdData && (
          <Circle
            center={props.position}
            radius={100000}
            pathOptions={{ fillColor: "blue", fillOpacity: 0.125 }}
            weight={0.3}
          />
        )}

        {props.birdData &&
          props.birdData.map((bird) => {
            return (
              <Marker
                key={bird.id}
                position={[parseFloat(bird.lat), parseFloat(bird.lon)]}
                icon={craneIcon}
              >
                <Popup
                  key={bird.id}
                  position={[parseFloat(bird.lat), parseFloat(bird.lon)]}
                >
                  <div>
                    <h3>{bird.en}</h3>
                    <h5>
                      (
                      <i>
                        {bird.gen} {bird.sp}
                      </i>
                      ) <br />
                      Date recorded: {bird.date} <br />
                      <audio controls preload="auto">
                        <source src={bird.file} type="audio/wav" />
                        <source src={bird.file} type="audio/mpeg3" />
                        <source src={bird.file} />
                        <p>
                          Audio playback not supported.
                          <a href={bird.file}>Download</a> the file, or try a
                          different browser.
                        </p>
                      </audio>{" "}
                      <br />
                      Call notes: {bird.type} <br />
                      Call quality (A to E): {bird.q} <br />
                      <a
                        href={
                          "https://search.brave.com/images?q=" +
                          bird.en +
                          " (" +
                          bird.gen +
                          " " +
                          bird.sp +
                          ")"
                        }
                        target="_blank"
                      >
                        Image search
                      </a>
                    </h5>
                    <h3>
                      {props.user && (
                        <button onClick={confirmBird} value={bird.id}>
                          Confirm that bird!
                        </button>
                      )}
                    </h3>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}

export default BirdMap;
