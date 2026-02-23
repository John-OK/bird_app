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

  const deleteAllBirds = (birdCount) => {
    const userConfirmed = confirm(
      `This will delete ALL (${birdCount}) bird records permanently.\nAre you sure you want to delete ALL records?`,
    );
    if (!userConfirmed) {
      return;
    }
    axios
      .delete("/delete_birds/")
      .then((response) => {
        setBirds([]);
        alert("All bird records deleted.");
      })
      .catch((error) => console.log(error));
  };

  const deleteBird = (birdId) => {
    const userConfirmed = confirm(
      "Are you sure you want to delete this record?\nThis action is permanent.",
    );
    if (!userConfirmed) {
      return;
    }
    axios
      .delete(`/delete_bird/${birdId}/`)
      .then((response) => {
        const updatedBirds = birds.filter((bird) => bird.id !== birdId);
        setBirds(updatedBirds);
        alert("Bird record deleted.");
      })
      .catch((error) => console.log(error));
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
                  <th scope="col" className="text-center">
                    Actions
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
                    <td className="text-center">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          deleteBird(bird.id);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-secondary">
                <tr>
                  <td colSpan="4" className="text-end p-3">
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => deleteAllBirds(birds.length)}
                    >
                      Delete ALL ({birds.length}) Bird Records
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBirdsPage;
