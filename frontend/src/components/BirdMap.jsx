import React, {Component, useEffect, useState, useRef} from "react";
import { MapContainer, TileLayer, Popup, useMap, Marker, Circle } from 'react-leaflet'
import L from 'leaflet'
import origamiBird from '../assets/icons/origami_bird.png'
import crane from '../assets/icons/icons8-crane-bird-100-filled.png'
import geoLocation from '../utils/geoLocation'


const origamiBirdIcon = new L.icon({
    iconUrl: origamiBird,
    iconSize: [100, 100],
    iconAnchor: [28,100],
    popupAnchor: [0,0]
})

const craneIcon = new L.icon({
    iconUrl: crane,
    iconSize: [100, 100],
    iconAnchor: [50,100],
    popupAnchor: [0,0]
})

function BirdMap(props) {
    const [center, setCenter] = useState({ lat: 39.240, lng: -5.740});
    const ZOOM_LEVEL = 9;
    const mapRef = useRef();

    const defaultPosition = [39.240, -5.740];

    const location = geoLocation();

    const handleFlyTo = () => {
        console.log('Fly To')
        const { current = {} } = mapRef;
        const { leafletElement: map } = current;
        map.setView([0, 0])
    }

    const showLocation = () => {
        if( location.loaded && !location.error ) {
            mapRef.current.leafletElement.flyTo(
                [location.coords.lat, location.coords.lng],
                zoom=9,
                {animate: true})
        }else{
            alert(location.error.message)
        }
    }
    
    return(
        <div>
            <MapContainer className='map'
                center={defaultPosition}
                // center={props.position},
                zoom={9} // Zoom level 9 encompasses 100 km radius @ 890px height
                //style in css
            >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=e484871bf5b44b5ba81a0bfe4e5508ed"
            />

            {location.loaded && !location.error && (
                <Marker
                    position={[location.coords.lat, location.coords.lng]}
                    icon={craneIcon}
                >
                </Marker>
            )}

            <Marker
                position={defaultPosition}
                // position={props.position}
                icon={origamiBirdIcon}
            >
            </Marker>

            <Circle center={defaultPosition} radius={100000} />

            </MapContainer>

            <div>
                <button onClick={handleFlyTo}>
                    Fly to me
                </button>
            </div>
        </div>
    )
}

export default BirdMap;