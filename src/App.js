/*global google*/
import {
  Box,
  Text,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  Input,
  SkeletonText,
} from "@chakra-ui/react";

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useRef, useState } from "react";

import { CookiesProvider, useCookies } from "react-cookie";

const commuteTime = 40 * 60; // seconds
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
  const [cookies, setCookie] = useCookies(["location", "lat", "long"]);
  const [libraries] = useState(["places"]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(/** @type google.maps.Map */ null);
  const [directionsResponse, setDirectionsResponse] = useState(null);

  //for markers
  const [id, setId] = useState(0);
  const [markers, setMarkers] = useState([]);
  const [drawMarker, setDrawMarker] = useState(true);

  const addMarker = (coords) => {
    setId((id) => id + 1);
    setMarkers((markers) => markers.concat([{ coords, id }]));
  };

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef();

  if (!isLoaded) {
    return <SkeletonText />;
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
          setCookie("location", originRef.current.value, { path: "/" });
          setCookie("lat", coord.lat, { path: "/" });
          setCookie("long", coord.lng, { path: "/" });
          if (drawMarker) {
            addMarker(coord);
            for (let i = 0; i < tubeStations.length; i++) {
              const tubeStation = tubeStations[i];
              getTime(address, tubeStation.name);
            }
          }
        } else {
          console.log("Geocoding failed: " + status);
        }
      }
    );
  }

  // Gets the time from the Google Maps API to get from the origin to the destination using public transport
  async function getTime(origin, destination) {
    const directionsService = new google.maps.DirectionsService();
    await directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.TRANSIT,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          console.log(destination, result.routes[0].legs[0].duration);
          if (result.routes[0].legs[0].duration.value < commuteTime) {
            placeCircle(
              result.routes[0].legs[0].end_location,
              avgWalkingSpeed *
                (commuteTime - result.routes[0].legs[0].duration.value)
            );
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
      fillOpacity: 0.35,
      map,
      center: center,
      radius: radius,
    });
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
            onClick={(e) => (drawMarker ? addMarker(e.latLng.toJSON()) : null)}
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
                      draggable={drawMarker}
                      position={marker.coords}
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
              <Button colorScheme="gray" type="Filter" onClick={openFilterBox}>
                Filter
              </Button>
            </ButtonGroup>
          </HStack>
          <HStack spacing={4} mt={4} justifyContent="space-between">
            <Text>Location: {cookies.location} </Text>
          </HStack>
        </Box>
      </Flex>
    </CookiesProvider>
  );
}

export default App;
