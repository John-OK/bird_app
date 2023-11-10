import { useNavigate } from "react-router-dom";
import axios from 'axios';

// from NavBarBC
import {Nav, Navbar, Offcanvas} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'

function LogInPage() {
    let navigate = useNavigate();

    const submitLogIn = function(event){
        // LOGIC FOR CHECKING CORRECT PASSWORD (BACKEND?) AND RETURNING PROPER RESPONSE (i.e., REDIRECT TO SEARCH, OR WRONG PASSWORD MSG)
        event.preventDefault();
        axios.post('/login/', {email: event.target[0].value, password: event.target[1].value})
            .then((response)=>{
                console.log('login response from server: ', response)
                window.location.reload()
        })
        navigate("/");   
      }

    return (
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
                                <Nav.Link href="/#/signup">
                                Sign Up
                                </Nav.Link>         
                            </Nav>
                        </div>
                    </Navbar.Collapse>
                </Navbar>
            </div>


            <h2>Log In</h2>
            <form onSubmit={submitLogIn} >
            <label> Username:
                <br/>
                <input type="email" name="email" placeholder="Email address" autocomplete="username" required />
            </label> <br/> <br/>
            <label> Password:
                <br/>
                <input type="password" name="current-password" placeholder="Password" autocomplete="current-password" required />
            </label> <br/> <br/>
            <input type="submit" value="Submit" />
            </form>
        </div>
        ) 

}
export default LogInPage;