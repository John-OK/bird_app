import axios from 'axios';
import {useEffect, useState} from 'react';
import BirdMap from '../components/BirdMap';
import {Nav, Navbar, Offcanvas} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'
import { submitLogout } from '../utils/submitLogout.js';
import { useNavigate } from "react-router-dom";

function MyBirdsPage(props) {
    const [birds, setBirds] = useState(null)

    const getBirds = () => {
        axios.get(`/get_users_birds/`)
        .then( (response) => {
            try{
                console.log('response from getting user birds ', response)
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
                        <a href="/">Bird Confirm&trade;</a>
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
            </div>


        </div>
    )
}

export default MyBirdsPage;