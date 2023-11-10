import {Nav, Navbar} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'
import { submitLogout } from '../utils/submitLogout.js';
import axios from 'axios'
import {useEffect, useState} from 'react';
import BirdMap from './BirdMap.jsx';

function NavBarBC(props) {

  const [position, setPosition] = useState(null)
  const [birdData, setBirdData] = useState(null)
  const [boxLimits, setBoxLimits] = useState(null)

  useEffect( ()=> {
      props.whoAmI()
      getUserLocation();
  }, [])

  function geolocationSuccess(position) {
    const coords = [position.coords.latitude, position.coords.longitude]
    console.log("User location is (lat, long): " + coords)
    const user_coords = {coords: coords}
    setPosition(coords)
    axios.post('/update_user_coords/', user_coords)
      .then( (response) => {
        console.log(`update_user_coords response from server: ${response.data}`)
      })
  }

  function geolocationError(error) {
    if (error.code === 1) {
      alert("Allow geolocation access for better results. Please check location permissions.");
      alert("Falling back to coarse location method")
      getUserLocationFallback();
    } else {
      alert("Cannot get your current position.")
    }
  }

  function getUserLocation() {
    navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
  }

  function getUserLocationFallback() {
    axios.get('/geolocate/')
        .then((response) => {
          try{
            const coords = response.data.coords
            setPosition(coords)
            console.log(response)
          }
          catch{setPosition([37.746, -119.590])} // Yosemite Village
        })
  }

  const checkBird = (event) => {
    event.preventDefault();
    let birdName = document.getElementById('name').value
    // Handle no user input for birdName. Will get all birds in radius around user
    if (birdName === "") {
      birdName = "ALL"
    }
    console.log(`request to check: ${birdName}`)
    axios.get(`/find_birds/${birdName}`)
        .then(response => {
          console.log(`response for ${birdName} follows:`)
          console.log(response)
          const nearbyBirds = response.data.filtered_data.filtered_birds
          setBirdData(nearbyBirds)
          setBoxLimits(response.data.box_limits)
        })
}

  return (
    <div>
      <div>
        <Navbar bg="dark" variant="dark" sticky="top" expand="md" collapseOnSelect>
          <Navbar.Brand >
            <a href="/">hellobirdie</a>
            <span> Welcome, {props.user ? props.user : "friend"}!</span>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <div>
              <form onSubmit={checkBird} autoComplete="on" >
              <label>
                  <input id='name' type="text" placeholder="Name (blank for all birds)" />
              </label>
              <button type="submit">Check</button>
              </form>
            </div>

            <div>
              <Nav>
                {props.user ? (
                  <>
                    {/* <Nav.Link href="/#/myBirds">
                      MyBirds
                    </Nav.Link> */}
                    <Nav.Link onClick={submitLogout}>
                      Log Out
                    </Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link href="/#/login" >
                      Log In
                    </Nav.Link>
                    <Nav.Link href="/#/signup">
                      Sign Up
                    </Nav.Link>
                  </>
                )}
              </Nav>
            </div>
          </Navbar.Collapse>
        </Navbar>
      </div>
      <div>
        {position && 
        <BirdMap  position={position} birdData={birdData} boxLimits={boxLimits} user={props.user} />}
        
      </div>
    </div>
    
  );
}

export default NavBarBC;