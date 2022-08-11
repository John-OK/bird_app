import axios from 'axios';
import {useEffect, useState} from 'react';
import BirdMap from '../components/BirdMap';

function HomePage(props) {
    const [position, setPosition] = useState([39.240, -5.740])

    useEffect( ()=> {
        props.whoAmI()
        console.log('HomePage: whoAmI');
        getUserLocation();
    }, [])

    function getUserLocation() { 
        axios.get('/geolocate/')
            .then((response) => {
                const lat = response.data.lat;
                const long = response.data.lng;
                console.log(response)
                setPosition([lat, long])
    })
        }


    return(
        <div>
            <BirdMap position={position} />

        </div>
    )
}

export default HomePage;