import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
// import Link from 'react-bootstrap/NavLink';
import { submitLogout } from '../utils/utils.js';
import axios from 'axios'

function NavBarBC(props) {

  
  const submitLogout = function(event){
    axios.post('/logout')
        .then((response)=>{
        console.log('logout response from server: ', response)
    })
    document.location.href="/"
}
  return (
    <Navbar bg="light">
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
    </Navbar>
  );
}

export default NavBarBC;