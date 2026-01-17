import axios from 'axios';
import {useEffect, useState} from 'react';
import {Nav, Navbar} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'
import { submitLogout } from '../utils/submitLogout.js';
import BirdList from '../components/BirdList.jsx'

function MyBirdsPage(props) {
    const [birds, setBirds] = useState([])
    
    useEffect( ()=> {
        getBirds();
    }, [])

    const getBirds = () => {
        axios.get(`/get_users_birds/`)
        .then( (response) => {
                // console.log('response from getting user birds: ', response)
                // console.log('response.data: ', response.data)
                // console.log('response.data.birds: ', response.data.birds)
                // setBirds((currentBirds) => currentBirds.push(...response.data.birds))
                setBirds(response.data.birds)
                console.log(birds[0])
                // console.log(birds[0].name)
                // console.log(`response.data.birds is Array? ${Array.isArray(response.data.birds)}`)
                // console.log(`response.data.birds[0] is Array? ${Array.isArray(response.data.birds[0])}`)
        })
        // .then(response => {
        //     console.log("birds=", birds)
        //     console.log("birds 2 =", birds[0])
        //     console.log("birds 1 =", birds[1])
        // })
        .catch(error => console.log(error))
    }

    const deleteBirds = () => {
        axios.delete('/delete_birds/')
            .then( (response) => {
                try{
                    console.log('response from deleting user birds', response)
                }
                catch{}
            })
    }

    return(
        <div>
            <div>
                <Navbar bg="dark" variant="dark" sticky="top" expand="md" collapseOnSelect>
                    <Navbar.Brand>
                        <a href="/">HelloBirdie</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />

                    <Navbar.Collapse>
                        <div>
                            <Nav>
                                <Nav.Link onClick={deleteBirds}>
                                    Delete Birds
                                </Nav.Link>
                                <Nav.Link onClick={submitLogout}>
                                    Log Out
                                </Nav.Link>
                            </Nav>
                        </div>
                    </Navbar.Collapse>
                </Navbar>
            </div>

            <div>
                <h2>Saved Birds</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Coordinates (lat, long)</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* {birds.map( (bird) => (
                            <tr key=bird.id>
                                <td>{bird.name}</td>
                                <td>{bird.coords}</td>
                            </tr>
                        ))} */}
                    </tbody>
                </table>
                <h1>Typeof(birds): { Array.isArray(birds) ? "Array" : "Not an array" }</h1>
                <BirdList birds={birds} />
            </div>


        </div>
    )
}

export default MyBirdsPage;