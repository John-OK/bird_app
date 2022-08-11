import React, {Component, useEffect, useState} from "react";
import { MapContainer, TileLayer, Popup, useMap, Marker } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios';
import pin from '../assets/icons/icons8-crane-bird-50.png'

function getIcon(iconSize) {
    return L.icon({
        iconUrl: pin,
        iconSize: [iconSize]
    })
}

function BirdMap(props) {
    const defaultPosition = [39.240, -5.740];
    
    return(
        <div>
            <MapContainer className='map'
                center={defaultPosition}
                // center={props.position},
                zoom={9}
                //style in css
            >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=e484871bf5b44b5ba81a0bfe4e5508ed"
            />
            <Marker
                position={defaultPosition}
                // position={props.position}
                icon={getIcon(50)}
            >
            </Marker>

            </MapContainer>
        </div>
    )
}

export default BirdMap;