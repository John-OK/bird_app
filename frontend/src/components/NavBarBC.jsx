import {Nav, Navbar, Offcanvas} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'
import { submitLogout } from '../utils/utils.js';
import axios from 'axios'

function NavBarBC(props) {

  const checkBird = () => {
    event.preventDefault();
    let birdName = document.getElementById('name').value
    console.log("Caw!!! Caw!!!")
    console.log(`request to check: ${birdName}`)
    axios.get("/xeno-canto-api")
        .then(response => {
            console.log(response);
        })
}
  
  const submitLogout = function(event){
    axios.post('/logout/')
        .then((response)=>{
        console.log('logout response from server: ', response)
    })
    document.location.href="/"
}

  return (
    <Navbar bg="dark" variant="dark" sticky="top" expand="md" collapseOnSelect>
      <Navbar.Brand>
        Bird Confirm&trade;
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <div>
          <form onSubmit={checkBird} >
          <label>
              <input id='name' type="text" placeholder="Commmon name of bird" />
          </label>
          <button type="submit">Check</button>
          </form>
        </div>
        <Nav>
          <Nav.Link href="/#/signup">
            Sign Up
          </Nav.Link>
          <Nav.Link href="/#/login" >
            Log In
          </Nav.Link>
          <Nav.Link onClick={submitLogout}>
            Log Out
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavBarBC;