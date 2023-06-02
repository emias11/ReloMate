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

const center = { lat: 51.4988, lng: -0.181718 };

function App() {

  const [cookies, setCookie] = useCookies(["location"]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [map, setMap] = useState(/** @type google.maps.Map */ null);
  const [directionsResponse, setDirectionsResponse] = useState(null);

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef();
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destiantionRef = useRef();

  if (!isLoaded) {
    return <SkeletonText />;
  }

  async function placeMarker() {
    // if (originRef.current.value === "") {
    //   return;
    // }
    // // eslint-disable-next-line no-undef
    // const directionsService = new google.maps.DirectionsService();
    // const results = await directionsService.route({
    //   origin: originRef.current.value,
    //   destination: destiantionRef.current.value,
    //   // eslint-disable-next-line no-undef
    //   travelMode: google.maps.TravelMode.DRIVING,
    // });
    const center = { lat: 48.8584, lng: 2.2945 };
    <Marker position={center} />;
    setCookie("location", originRef.current.value, { path: "/" });
    //<Marker position={{ lat: 51.4988, lng: -0.181718 }} />;
    //setDirectionsResponse(results);
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
            center={center}
            zoom={15}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            options={{
              zoomControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
            onLoad={(map) => setMap(map)}
          >
            {/* <Marker position={center} /> */}
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
                  placeholder="Where will you be working"
                  ref={originRef}
                />
              </Autocomplete>
            </Box>

            <ButtonGroup>
              <Button colorScheme="pink" type="Place" onClick={placeMarker}>
                Place
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
