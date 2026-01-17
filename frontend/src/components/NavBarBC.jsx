import { Nav, Navbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import { submitLogout } from "../utils/submitLogout.js";
import axios from "axios";
import { useEffect, useState } from "react";
import BirdMap from "./BirdMap.jsx";

function normalizeTerm(term, searchType) {
  let normalized = (term || "").trim();
  normalized = normalized.replace(/[ʻ]/g, "");
  normalized = normalized.replace(/[’‘ʼ]/g, "'");
  normalized = normalized.replace(/[–—‑]/g, "-");
  normalized = normalized.replace(/\s+/g, " ");

  if (searchType === "common") {
    normalized = normalized.replace(/\bsaint\b\.?/gi, "St.");
    normalized = normalized.replace(/\bst\b\.?/gi, "St.");
  }

  return normalized;
}

function validateTerm(term, searchType) {
  if (!term) {
    if (
      searchType === "common" ||
      searchType === "genus" ||
      searchType === "species"
    ) {
      return "Search term cannot be empty.";
    }
    return null;
  }

  if (searchType === "genus") {
    if (!/^[A-Za-z]+$/.test(term)) {
      return "Genus must contain only letters A-Z (no spaces or punctuation).";
    }
    return null;
  }

  if (searchType === "species") {
    if (!/^[A-Za-z]+( [A-Za-z]+)?$/.test(term)) {
      return "Species must be one or two words using only letters A-Z (e.g. 'subbuteo' or 'Falco subbuteo').";
    }
    return null;
  }

  if (searchType === "common") {
    if (!/^[\p{L}\p{M} .\-']+$/u.test(term)) {
      return "Search contains invalid characters. Allowed special characters are: -, ', .";
    }
  }

  return null;
}

function NavBarBC(props) {
  const [position, setPosition] = useState(null);
  const [birdData, setBirdData] = useState(null);
  const [boxLimits, setBoxLimits] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commonName, setCommonName] = useState("");
  const [genus, setGenus] = useState("");
  const [species, setSpecies] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  useEffect(() => {
    props.whoAmI();
    getUserLocation();
  }, []);

  const activeSearchType = commonName.trim()
    ? "common"
    : genus.trim()
      ? "genus"
      : species.trim()
        ? "species"
        : "all";

  const rawTerm =
    activeSearchType === "common"
      ? commonName
      : activeSearchType === "genus"
        ? genus
        : activeSearchType === "species"
          ? species
          : "";

  const normalizedTerm = normalizeTerm(rawTerm, activeSearchType);
  const liveValidationError = validateTerm(normalizedTerm, activeSearchType);
  const isSubmitDisabled = Boolean(liveValidationError) || loading;

  function geolocationSuccess(position) {
    const coords = [position.coords.latitude, position.coords.longitude];
    console.log("User location is (lat, long): " + coords);
    const user_coords = { coords: coords };
    setPosition(coords);
    axios.post("/update_user_coords/", user_coords).then((response) => {
      console.log(`update_user_coords response from server: ${response.data}`);
    });
  }

  function geolocationError(error) {
    if (error.code === 1) {
      alert(
        "Allow geolocation access for better results. Please check location permissions.",
      );
      alert("Falling back to coarse location method");
      getUserLocationFallback();
    } else {
      alert("Cannot get your current position.");
    }
  }

  function getUserLocation() {
    navigator.geolocation.getCurrentPosition(
      geolocationSuccess,
      geolocationError,
    );
  }

  function getUserLocationFallback() {
    axios.get("/geolocate/").then((response) => {
      try {
        const coords = response.data.coords;
        setPosition(coords);
        console.log(response);
        console.log("position[0]: ", position[0]);
        if (position[0] === 37.16000000001) {
          console.log("Abstract call failed. Lat: ", coords[0]);
          alert(
            "Could not locate your position. Please enable location on your device and allow location in your browser.",
          );
        }
      } catch {
        setPosition([37.746, -119.59]);
      } // Yosemite Village
    });
  }

  const checkBird = (event) => {
    event.preventDefault();
    setSearchError("");
    setSearchStatus("");
    setLoading(true);
    const filledCount = [
      commonName.trim(),
      genus.trim(),
      species.trim(),
    ].filter(Boolean).length;
    if (filledCount > 1) {
      setSearchError(
        "Please fill only one search field: Common name, Genus, or Species.",
      );
      setLoading(false);
      return;
    }

    const search_type = activeSearchType;
    const term = normalizedTerm;
    if (liveValidationError) {
      setSearchError(liveValidationError);
      setLoading(false);
      return;
    }

    if (search_type === "common") {
      setCommonName(term);
    } else if (search_type === "genus") {
      setGenus(term);
    } else if (search_type === "species") {
      setSpecies(term);
    }

    console.log(`request to check. search_type=${search_type} term=${term}`);
    axios
      .post("/find_birds/", { search_type, term })
      .then((response) => {
        console.log("response follows:");
        console.log(response);
        if (response.data && response.data.error) {
          setSearchError(
            response.data.error.message || "Xeno-canto search failed.",
          );
          setLoading(false);
          return;
        }
        const nearbyBirds = response.data.filtered_data.filtered_birds;
        setBirdData(nearbyBirds);
        setBoxLimits(response.data.box_limits);
        if (nearbyBirds.length === 0) {
          setSearchStatus("No recordings found in your area.");
        } else {
          setSearchStatus(`Found ${nearbyBirds.length} recordings.`);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setSearchError("Bird search failed.");
        setLoading(false);
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
            <span> Welcome, {props.user ? props.user : "friend"}!</span>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <div>
              <form onSubmit={checkBird} autoComplete="on">
                <label>
                  <input
                    id="common_name"
                    type="text"
                    placeholder="Common name"
                    value={commonName}
                    onChange={(e) => {
                      setSearchError("");
                      setSearchStatus("");
                      setCommonName(e.target.value);
                      if (e.target.value) {
                        setGenus("");
                        setSpecies("");
                      }
                    }}
                    disabled={
                      activeSearchType !== "common" &&
                      activeSearchType !== "all"
                    }
                  />
                </label>
                <label>
                  <input
                    id="genus"
                    type="text"
                    placeholder="Genus"
                    value={genus}
                    onChange={(e) => {
                      setSearchError("");
                      setSearchStatus("");
                      setGenus(e.target.value);
                      if (e.target.value) {
                        setCommonName("");
                        setSpecies("");
                      }
                    }}
                    disabled={
                      activeSearchType !== "genus" && activeSearchType !== "all"
                    }
                  />
                </label>
                <label>
                  <input
                    id="species"
                    type="text"
                    placeholder="Species (e.g. Falco subbuteo or subbuteo)"
                    value={species}
                    onChange={(e) => {
                      setSearchError("");
                      setSearchStatus("");
                      setSpecies(e.target.value);
                      if (e.target.value) {
                        setCommonName("");
                        setGenus("");
                      }
                    }}
                    disabled={
                      activeSearchType !== "species" &&
                      activeSearchType !== "all"
                    }
                  />
                </label>
                <button type="submit" disabled={isSubmitDisabled}>
                  {loading ? "Loading birds..." : "Check for birds"}
                </button>
                {(liveValidationError || searchError || searchStatus) && (
                  <div>
                    {(liveValidationError || searchError) && (
                      <div style={{ color: "#ffb3b3" }}>
                        {searchError || liveValidationError}
                      </div>
                    )}
                    {searchStatus && (
                      <div style={{ color: "#b3ffb3" }}>{searchStatus}</div>
                    )}
                  </div>
                )}
              </form>
            </div>

            <div>
              <Nav>
                {props.user ? (
                  <>
                    <Nav.Link href="/#/myBirds">MyBirds</Nav.Link>
                    <Nav.Link onClick={submitLogout}>Log Out</Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link href="/#/login">Log In</Nav.Link>
                    <Nav.Link href="/#/signup">Sign Up</Nav.Link>
                  </>
                )}
              </Nav>
            </div>
          </Navbar.Collapse>
        </Navbar>
      </div>
      <div>
        {position && (
          <BirdMap
            position={position}
            birdData={birdData}
            boxLimits={boxLimits}
            user={props.user}
          />
        )}
      </div>
    </div>
  );
}

export default NavBarBC;
