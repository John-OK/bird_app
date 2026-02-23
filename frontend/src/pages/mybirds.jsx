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

      <div className="container mt-4">
        <h2 className="mb-4">Saved Birds</h2>
        {birds.length === 0 ? (
          <div className="text-center mt-5 p-5 bg-secondary bg-opacity-25 rounded border">
            <h4 className="text-muted mb-3">No saved birds yet.</h4>
            <p className="lead">Confirm a bird to save it!</p>
            <p className="text-muted">
              (Click on a bird icon on the map. Then click "Confirm that bird!")
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered">
              <thead className="table-dark">
                <tr>
                  <th scope="col">Common Name</th>
                  <th scope="col" className="text-center">
                    Coordinates (lat, long)
                  </th>
                  <th scope="col" className="text-center">
                    Date Observed
                  </th>
                </tr>
              </thead>
              <tbody>
                {birds.map((bird) => (
                  <tr key={bird.id}>
                    <td>{bird.name}</td>
                    <td className="text-center">
                      {bird.coords[0]}, {bird.coords[1]}
                    </td>
                    <td className="text-center">{bird.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBirdsPage;
