/* global google */
import {
  Box,
  Text,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  Input,
  SkeletonText,
  Checkbox,
} from "@chakra-ui/react";

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useRef, useState, React } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { CookiesProvider, useCookies } from "react-cookie";

var commuteTime = 40 * 60; // seconds
const avgWalkingSpeed = 1; // m/s
const center = { lat: 51.4988, lng: -0.181718 };
const tubeStations = [
  { name: "Hammersmith", coords: { lat: 51.492268, lng: -0.222749 } },
  { name: "Barons Court", coords: { lat: 51.4902, lng: -0.2137 } },
  { name: "West Kensington", coords: { lat: 51.4902, lng: -0.2137 } },
  { name: "Earls Court", coords: { lat: 51.4912, lng: -0.1931 } },
  { name: "Gloucester Road", coords: { lat: 51.4941, lng: -0.1829 } },
  { name: "South Kensington", coords: { lat: 51.4941, lng: -0.1737 } },
  { name: "Southall", coords: { lat: 51.5054, lng: -0.378 } },
];

function App() {
  const [cookies, setCookie] = useCookies(["location", "prev", "lat", "long"]);
  const [libraries] = useState(["places"]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(/** @type google.maps.Map */ null);
  const [directionsResponse, setDirectionsResponse] = useState(null);

  // Track the circles added to the map
  const [circles, setCircles] = useState([]);

  //for markers
  const [id, setId] = useState(0);
  const [markers, setMarkers] = useState([]);

  const addMarker = (coords) => {
    setId((id) => id + 1);
    setMarkers((markers) => markers.concat([{ coords, id }]));
  };

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef();
  const inputRef = useRef(null);

  if (!isLoaded) {
    return <SkeletonText />;
  }

  async function saveCommuteTime() {
    commuteTime = inputRef.current.value * 60;
  }

  async function removeMarker(id) {
    setMarkers((markers) => markers.filter((marker) => marker.id !== id));
  }

  async function placeMarker() {
    let address = originRef.current.value;
    var geocoder = new google.maps.Geocoder();
    await geocoder.geocode(
      { address: address },
      async function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          const coord = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          };
          //will store text location, lat, long all as strings
          setCookie("prev", cookies.location, { path: "/" });
          setCookie("location", originRef.current.value, { path: "/" });
          setCookie("lat", coord.lat, { path: "/" });
          setCookie("long", coord.lng, { path: "/" });
          clearCircles();
          setMarkers([]);
          addMarker(coord);
          getTime(address);
        } else {
          console.log("Geocoding failed: " + status);
        }
      }
    );
    setCookie("location", originRef.current.value, { path: "/" });
  }

  // Gets the time from the Google Maps API to get from the origin to the destination using public transport
  async function getTime(origin) {
    const directionsService = new google.maps.DistanceMatrixService();
    await directionsService.getDistanceMatrix(
      {
        origins: [origin],
        destinations: tubeStations.map((station) => station.coords),
        travelMode: google.maps.TravelMode.TRANSIT,
      },
      (result, status) => {
        if (status === "OK") {
          console.log(result);
          console.log(origin);
          let address = originRef.current.value;
          var geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { address: address },
            async function (results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                const originCoord = {
                  lat: results[0].geometry.location.lat(),
                  lng: results[0].geometry.location.lng(),
                };
                placeCircle(originCoord, avgWalkingSpeed * commuteTime);
              }
            }
          );

          for (let i = 0; i < tubeStations.length; i++) {
            const tubeStation = tubeStations[i];
            if (result.rows[0].elements[i].duration.value < commuteTime) {
              placeCircle(
                tubeStation.coords,
                avgWalkingSpeed *
                  (commuteTime - result.rows[0].elements[i].duration.value)
              );
            }
          }
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  }

  // Places a circle on the map with the given center and radius
  async function placeCircle(center, radius) {
    const circle = new google.maps.Circle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 0,
      fillColor: "#FF0000",
      fillOpacity: 0.15,
      map,
      center: center,
      radius: radius,
    });

    // Add the circle to the circles state
    setCircles((prevCircles) => [...prevCircles, circle]);
  }

  async function placePrevMarker() {
    originRef.current.value = cookies.prev;
    placeMarker();
  }

  // Clear all circles from the map
  function clearCircles() {
    // Remove each circle from the map
    circles.forEach((circle) => circle.setMap(null));

    // Clear the circles state
    setCircles([]);
  }

  return (
    <CookiesProvider>
      <Flex
        position="relative"
        flexDirection="column"
        alignItems="center"
        h="100vh"
        w="100vw"
      >
        <Box position="absolute" left={0} top={0} h="100%" w="100%">
          {/* Google Map Box */}
          <GoogleMap
            onClick={(e) => addMarker(e.latLng.toJSON())}
            center={center}
            zoom={12}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            options={{
              zoomControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
            onLoad={(map) => setMap(map)}
          >
            console.log(cookies);
            {
              <Marker
                position={{
                  lat: Number(cookies.lat),
                  lng: Number(cookies.long),
                }}
              />
            }
            {markers
              ? markers.map((marker) => {
                  return (
                    <Marker
                      key={marker.id}
                      draggable={false}
                      position={marker.coords}
                      onClick={() => removeMarker(marker.id)}
                      onDragEnd={(e) => (marker.coords = e.latLng.toJSON())}
                    />
                  );
                })
              : null}
            {directionsResponse && (
              <DirectionsRenderer directions={directionsResponse} />
            )}
          </GoogleMap>
        </Box>
        <Box
          p={4}
          borderRadius="lg"
          m={4}
          bgColor="white"
          shadow="base"
          minW="container.md"
          zIndex="1"
        >
          <HStack spacing={2} justifyContent="space-between">
            <Box flexGrow={1}>
              <Autocomplete>
                <Input
                  type="text"
                  placeholder="Where will you be working..."
                  ref={originRef}
                />
              </Autocomplete>
            </Box>

            <ButtonGroup>
              <Button colorScheme="pink" type="Place" onClick={placeMarker}>
                Place
              </Button>
              <Popup
                trigger={<Button colorScheme="gray"> Filter </Button>}
                position={"bottom center"}
              >
                <label>Max commute time </label>
                <input ref={inputRef} type="number" size={1} />
                <Button onClick={saveCommuteTime}> Enter </Button> <div></div>
                <Checkbox />
                <span> Tube </span>
                <Checkbox />
                <span> Walking </span> <div></div>
                <Checkbox />
                <span> Cycling </span>
              </Popup>
            </ButtonGroup>
          </HStack>
          <HStack spacing={4} mt={4} justifyContent="space-between">
            <Text> Location: {cookies.location} </Text>
            <Button colourScheme="white" onClick={placePrevMarker}>
              {cookies.prev}
            </Button>
          </HStack>
        </Box>
      </Flex>
    </CookiesProvider>
  );
}

export default App;
