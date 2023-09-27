import React, {useState, useEffect} from 'react';

const geoLocation = () => {
    const [location, setLocation] = useState({
        loaded: false,
        coords: { lat: "", lng: "" }
    });

    const onSuccess = (location) => {
        setLocation({
            loaded: true,
            coords: {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            },
        });
    };

    const onError = (error) => {
        setLocation({
            loaded: true,
            error,
        })
    }

    useEffect( () => {
        if( !("geolocation" in navigator) ) {
            onError({
                code: 0,
                message: "Geolocation not supported",
            });
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }, [])

    console.log(`location from geoLocation util: ${location}`)
    console.log(location)
    return location;
}

export default geoLocation