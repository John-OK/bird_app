import { useNavigate } from "react-router-dom";
import axios from 'axios';

// from NavBarBC
import {Nav, Navbar, Offcanvas} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'
import { submitLogout } from '../utils/submitLogout.js';

function SignUpPage() {
    let navigate = useNavigate();

    function submitSignupForm(event){
        // CHECK IF SUCCESS/FAIL AND RETURN PROPER BEHAVIOR
        // CHECK IF ALREADY A USER AND RETURN PROPER RESPONSE/BEHAVIOR
        event.preventDefault()        

        axios.post('/signup/', {email: event.target[0].value, password: event.target[1].value})
        .then((response)=> {
          try{
            console.log('signup response from server: ', response)
          }
          catch{error}
            
        })
        //WOULD LIKE TO HAVE NEW USER AUTO LOGGED IN AFTER SIGN UP, THEN REDIRECT TO ""../search"
        // axios.post('/login', {email: event.target[0].value, password: event.target[1].value})
        //     .then((response)=>{
        //         console.log('login response from server: ', response)
        //         window.location.reload()
        // })
        navigate("../login");        

    }

    return (
        <div>
            <div>
              <Navbar bg="dark" variant="dark" sticky="top" expand="md" collapseOnSelect>
                <Navbar.Brand>
                  Bird Confirm&trade;
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse>

                <div>
                  <Nav>
                    <Nav.Link href="/#/login" >
                      Log In
                    </Nav.Link>        
                  </Nav>
                </div>
                </Navbar.Collapse>
              </Navbar>
            </div>

            <h2>Sign Up</h2>
            <form onSubmit={submitSignupForm} >
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
export default SignUpPage;