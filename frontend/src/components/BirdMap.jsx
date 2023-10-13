import React, {Component, useEffect, useState, useRef} from "react";
import { MapContainer, TileLayer, Popup, useMap, Marker, Circle, Rectangle } from 'react-leaflet'
import L from 'leaflet'
import userPin from '../assets/icons/icons8-pin-64.png'
import crane from '../assets/icons/icons8-crane-bird-50.png'
import binos from '../assets/icons/icons8-binoculars-80.png'
import geoLocation from '../utils/geoLocation'
import axios from "axios";


const userIcon = new L.icon({
    iconUrl: userPin,
    iconSize: [100, 100],
    iconAnchor: [50,93],
    popupAnchor: [0,-80]
})

const craneIcon = new L.icon({
    iconUrl: crane,
    iconSize: [50, 50],
    iconAnchor: [25,50],
    popupAnchor: [6,-49]
})

const binosIcon = new L.icon({
    iconUrl: binos,
    iconSize: [50, 50],
    iconAnchor: [25,25],
    popupAnchor: [0,-12]
})

function BirdMap(props) {
//     const [center, setCenter] = useState({ lat: 39.240, lng: -5.740});
//     const ZOOM_LEVEL = 9;
//     const mapRef = useRef();
    const IMAGE_SEARCH_URL = "https://search.brave.com/images?q="

    const location = geoLocation();

    const confirmBird = function(event) {
        event.preventDefault();
        const birdToConfirm = {}

        props.birdData.forEach( (bird) => {
            if (bird.id === event.target.value) {
                birdToConfirm.user = props.user
                birdToConfirm.bird_name = bird.en
                birdToConfirm.user_lat = props.position[0]
                birdToConfirm.user_lng = props.position[1]
                birdToConfirm.data = JSON.stringify(bird)
                // JSON.parse(object to parse) to unstringify

                console.log('sending the below data to server:')
                console.log(birdToConfirm)
            }
        })
        axios.post('/confirm_bird/', birdToConfirm)
            .then( (response) => {
                console.log('bird_confirm response from server: ', response)
            
            })
    }

    // const handleFlyTo = () => {
    //     console.log('Fly To')
    //     const { current = {} } = mapRef;
    //     const { leafletElement: map } = current;
    //     map.setView([0, 0])
    // }

    // const showLocation = () => {
    //     if( location.loaded && !location.error ) {
    //         mapRef.current.leafletElement.flyTo(
    //             [location.coords.lat, location.coords.lng],
    //             zoom=9,
    //             {animate: true})
    //     }else{
    //         alert(location.error.message)
    //     }
    // }

    const url = 
        `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
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
    
    return(
        <div>
            <MapContainer className='map'
                center={props.position}
                zoom={9} // Zoom level 9 encompasses 100 km radius @ 890px height
                //style in css
            >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={url}
            />
        

            {(location.loaded && !location.error) ? (
                <Marker
                    position={[location.coords.lat, location.coords.lng]}
                    icon={userIcon}
                >

                <Popup>
                    <h6>
                        Your location <br />
                    </h6>
                </Popup>
                </Marker>
            ) : (
                <Marker
                position={props.position}
                icon={binosIcon}
            >
                <Popup>
                    <h5>
                        Your estimated location
                    </h5>
                </Popup>
                </Marker>
            )}

            {props.birdData && 
                <Rectangle 
                bounds={props.boxLimits}
                pathOptions={{fillColor:'blue', fillOpacity:0.125}}
                weight={0.3} />
                // {/* <Circle center={props.position} radius={100000} /> */}
            }

            {props.birdData && props.birdData.map( (bird) => {
                return(
                    <Marker
                        key={bird.id}
                        position={[parseFloat(bird.lat), parseFloat(bird.lng)]}
                        icon={craneIcon}
                    >
                        <Popup
                            key={bird.id}
                            position={[parseFloat(bird.lat), parseFloat(bird.lng)]}
                        >
                            <div>
                                <h3>{bird.en}</h3>
                                <h5>
                                    (<i>{bird.gen} {bird.sp}</i>) <br />
                                    Date recorded: {bird.date} <br />
                                    <a href={bird.file} target="_blank">Bird call link</a> <br />
                                    Call notes: {bird.type} <br />
                                    Call quality (A to E): {bird.q} <br />
                                    <a href={"https://search.brave.com/images?q=" + bird.en} target="_blank">Image search</a>
                                </h5>
                                <h3>
                                    {props.user && 
                                    <button onClick={confirmBird} value={bird.id} >Confirm that bird!</button>
                                    }
                                </h3>     
                            </div>
                        </Popup>
                    </Marker>)
            })}

            </MapContainer>
        </div>
    )
}

export default BirdMap;