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
  Circle
} from "@react-google-maps/api";
import { useRef, useState } from "react";

import { CookiesProvider, useCookies } from "react-cookie";

const center = { lat: 51.4988, lng: -0.181718 };
const walkingSpeed = 1;

function App() {
  const [cookies, setCookie] = useCookies(["location"]);
  const [libraries] = useState(["places"]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(/** @type google.maps.Map */ null);
  const [directionsResponse, setDirectionsResponse] = useState(null);

  //for directions
  const [transitTime, setTransitTime] = useState('');
  const [distance, setDistance] = useState('');

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

  const placeMarker = () => (
    drawMarker ? addMarker(center) : null,
    setCookie("location", originRef.current.value, { path: "/" })
  );

  function getLatLong(address) {
    // var geocoder = new google.maps.Geocoder();
    // geocoder.geocode({ address: address }, function (results, status) {
    //   if (status == google.maps.GeocoderStatus.OK) {
    //     return results[0].geometry.location;
    //   } else {
    //     console.log("Geocoding failed: " + status);
    //   }
    // });
  }

  function calcRoute() {
    const service = new google.maps.DistanceMatrixService();
    const GloucesterRoad = { lat: 51.4948, lng: -0.1827 };
    const EarlsCourt = { lat: 51.4920, lng: -0.1930 };
    const request = {
      origins: [GloucesterRoad],
      destinations: [EarlsCourt],
      travelMode: google.maps.TravelMode.TRANSIT,
      unitSystem: google.maps.UnitSystem.METRIC,
    };

    service.getDistanceMatrix(request, (response, status) => {
      if (status === "OK") {
        console.log(response);
        setTransitTime(response.rows[0].elements[0].duration.text);
        setDistance(response.rows[0].elements[0].distance.text);
      }
    }
    );
  }


  function calcCircleRadiusDistance() {
    //1 meter per second walking speed.
    //Change time in seconds with filter button slider.
    let distance = walkingSpeed * 2100
    return distance
  }

  const options = {
    strokeColor: '#FCF55F',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FFFAA0',
    fillOpacity: 0.35,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: calcCircleRadiusDistance(),
    zIndex: 1
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
            {/* <Marker position={center} /> */}
            {directionsResponse && (
              <DirectionsRenderer directions={directionsResponse} />
            )}
            {transitTime && (
            <Circle
              center={center}
              options={options}
            />
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
              <Button colorScheme="pink" type="Place" onClick={calcRoute}>
                Place
              </Button>
            </ButtonGroup>
          </HStack>
          <HStack spacing={4} mt={4} justifyContent="space-between">
            <Text>Location: {cookies.location} </Text>
            <Text>Distance: {distance} </Text>
            <Text>Duration: {transitTime} </Text>
          </HStack>
        </Box>
      </Flex>
    </CookiesProvider>
  );
}

export default App;