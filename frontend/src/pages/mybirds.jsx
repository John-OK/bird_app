import axios from "axios";
import { useEffect, useState } from "react";
import { Nav, Navbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import { submitLogout } from "../utils/submitLogout.js";

function MyBirdsPage(props) {
  const [birds, setBirds] = useState([]);

  useEffect(() => {
    getBirds();
  }, []);

  const getBirds = () => {
    axios
      .get(`/get_users_birds/`)
      .then((response) => {
        const birdsArray = response.data.birds;
        if (Array.isArray(birdsArray)) {
          setBirds(birdsArray);
        } else {
          setBirds([]);
        }
      })
      .catch((error) => console.log(error));
  };

  const deleteBirds = () => {
    axios.delete("/delete_birds/").then((response) => {
      try {
      } catch {}
    });
  };

  return (
    <div>
      <div>
        <Navbar
          bg="dark"
          variant="dark"
          sticky="top"
          expand="md"
          collapseOnSelect
        >
          <Navbar.Brand>
            <a href="/">HelloBirdie</a>
          </Navbar.Brand>
          <Navbar.Toggle />

          <Navbar.Collapse>
            <div>
              <Nav>
                <Nav.Link onClick={deleteBirds}>Delete Birds</Nav.Link>
                <Nav.Link onClick={submitLogout}>Log Out</Nav.Link>
              </Nav>
            </div>
          </Navbar.Collapse>
        </Navbar>
      </div>

      <div>
        <h2>Saved Birds</h2>
        {birds.length === 0 ? (
          <>
            <h4>No saved birds yet.</h4>
            <h4>Confirm a bird to save it!</h4>
            <h5>
              (Click on a bird icon on the map. Then click "Confirm that bird!")
            </h5>
          </>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Coordinates (lat, long)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {birds.map((bird) => (
                <tr key={bird.id}>
                  <td>{bird.name}</td>
                  <td>
                    {bird.coords[0]}, {bird.coords[1]}
                  </td>
                  <td>{bird.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default MyBirdsPage;
