import axios from 'axios';
import {useEffect, useState} from 'react';
import {Nav, Navbar} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'
import { submitLogout } from '../utils/submitLogout.js';

function MyBirdsPage(props) {
    const [birds, setBirds] = useState([])

    const getBirds = () => {
        axios.get(`/get_users_birds/`)
        .then( (response) => {
            try{
                console.log('response from getting user birds: ', response)
                console.log('response.data: ', response.data)
                console.log('response.data.birds: ', response.data.birds)
                setBirds((currentBirds) => currentBirds.push(...response.data.birds))
                console.log(birds[0])
                console.log(birds[0].name)
                console.log(`response.data.birds is Array? ${Array.isArray(response.data.birds)}`)
                console.log(`response.data.birds[0] is Array? ${Array.isArray(response.data.birds[0])}`)
            }
            catch{}
        })
    }

    useEffect( ()=> {
        getBirds();
    }, [])

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
                <h2>Confirmed Birds</h2>
                <h3>user's bird list: {birds}</h3>
                <h4>typeof(birds): {typeof(birds)}</h4>
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
            </div>


        </div>
    )
}

export default MyBirdsPage;