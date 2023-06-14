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
  Stack,
  useColorModeValue,
  IconButton,
  Spacer,
  Icon,
} from "@chakra-ui/react";

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";

import { RxCrossCircled } from "react-icons/rx";

import { useRef, useState, React } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { CookiesProvider, useCookies } from "react-cookie";
import { ReactComponent as TubeLogo } from "./logo.svg";

var commuteTime = 40 * 60; // seconds
const avgWalkingSpeed = 1; // m/s
const center = { lat: 51.4988, lng: -0.181718 };
const tubeStations = [
  {
    name: "Hammersmith",
    coords: { lat: 51.492268, lng: -0.222749 },
    generalinfo:
      "Hammersmith is a bustling district located in West London. The area offers a vibrant mix of shops, restaurants, and entertainment venues, making it appealing to individuals seeking an energetic urban atmosphere. Hammersmith is known for its picturesque riverside setting along the Thames, providing scenic views and recreational spaces. The district is also home to the Hammersmith Apollo, a renowned music and entertainment venue. Residents have access to various amenities, including schools like St. Paul's Girls' School and Godolphin and Latymer School, as well as healthcare facilities such as Hammersmith Hospital and Charing Cross Hospital.",
    priceinfo:
      "Hammersmith offers a range of rental options, including modern flats, period conversions, and spacious townhouses. The average renting price for a one-bedroom apartment ranges from £1,500 to £2,000 per month. The district attracts professionals and families who appreciate its central location, excellent transport links, and proximity to amenities.",
  },
  {
    name: "Barons Court",
    coords: { lat: 51.4902, lng: -0.2137 },
    generalinfo:
      "Barons Court is a residential neighborhood situated in West London, offering a tranquil and family-friendly environment. The area is characterized by tree-lined streets and charming garden squares, attracting residents seeking a peaceful atmosphere. Barons Court is conveniently located near Hammersmith, providing access to a wide range of amenities, including shops, restaurants, and entertainment options. The neighborhood offers proximity to Bishop's Park and Fulham Palace Gardens, which provide opportunities for outdoor activities and relaxation. The area is also well-served by schools such as Larmenier and Sacred Heart Catholic Primary School and Fulham Prep School.",
    priceinfo:
      "Barons Court is known for its purpose-built apartments and converted houses. The average renting price for a one-bedroom apartment ranges from £1,300 to £1,800 per month. It is popular among young professionals and students seeking affordable and convenient accommodation with good transport connections.",
  },
  {
    name: "Earls Court",
    coords: { lat: 51.4912, lng: -0.1931 },
    generalinfo:
      "Earls Court, located in the Royal Borough of Kensington and Chelsea, is a vibrant district known for its exhibition center. The area appeals to a diverse range of residents, including families and young professionals. Earls Court offers a mix of elegant period properties and modern apartments. The district boasts a vibrant nightlife, with numerous bars, clubs, and restaurants to explore. Residents can also enjoy easy access to nearby attractions such as Kensington Gardens, the Natural History Museum, and the Victoria and Albert Museum. Earls Court offers a range of amenities, including schools like Ashbourne Independent Sixth Form College and Kensington Preparatory School, as well as healthcare facilities such as The Lister Hospital and Bupa Cromwell Hospital.",
    priceinfo:
      "Earls Court offers a mix of period conversions, mansion flats, and modern apartments. The average renting price for a one-bedroom apartment ranges from £1,400 to £1,900 per month. The district appeals to professionals and students due to its central location, good transport links, and proximity to universities and employment hubs.",
  },
  {
    name: "Gloucester Road",
    coords: { lat: 51.4941, lng: -0.1829 },
    generalinfo:
      "Gloucester Road is a prestigious district in the Royal Borough of Kensington and Chelsea, known for its cultural attractions and elegant architecture. The area is home to renowned museums such as the Natural History Museum, the Victoria and Albert Museum, and the Science Museum, making it a haven for art and history enthusiasts. Gloucester Road offers a wealth of shopping options, with high-end boutiques and cafes along the bustling Gloucester Road itself. The district is well-served by schools such as Falkner House School and Eaton House The Vale. Residents have access to healthcare facilities such as Cromwell Hospital and Chelsea and Westminster Hospital.",
    priceinfo:
      "Gloucester Road boasts luxury apartments and period conversions. The average renting price for a one-bedroom apartment ranges from £1,500 to £2,100 per month. It attracts professionals, families, and students drawn to the convenient location, nearby amenities, and cultural attractions.",
  },
  {
    name: "South Kensington",
    coords: { lat: 51.4941, lng: -0.1737 },
    generalinfo:
      "South Kensington is an affluent district in the Royal Borough of Kensington and Chelsea, renowned for its prestigious museums and stunning architecture. The area appeals to those seeking a refined and cultured lifestyle. South Kensington is home to world-class educational institutions, including Imperial College London and the Royal College of Art, attracting students, academics, and professionals in related fields. The district offers a wealth of high-end shopping options, fine dining restaurants, and cafes. Residents can enjoy the nearby green spaces of Hyde Park and Kensington Gardens. Healthcare facilities, such as the Royal Marsden Hospital and Bupa Cromwell Hospital, are easily accessible in the area.",
    priceinfo:
      "South Kensington is known for its elegant period buildings and luxury apartments. The average renting price for a one-bedroom apartment ranges from £1,800 to £2,500 per month. The district appeals to affluent professionals, international students, and families who appreciate the prestigious reputation, world-class museums, and convenient access to amenities.",
  },
  {
    name: "Southall",
    coords: { lat: 51.5054, lng: -0.378 },
    generalinfo:
      "Southall is a vibrant and multicultural district located in the London Borough of Ealing. Known as 'Little India,' it is home to a large South Asian community, offering a rich cultural experience. The area features bustling markets, ethnic eateries, and vibrant festivals, making it a haven for food and culture enthusiasts. Southall appeals to residents who appreciate diverse culinary experiences and a strong sense of community. The district offers amenities such as schools, including Featherstone High School and Beaconsfield Primary School, and healthcare facilities like Southall Medical Centre.",
    priceinfo:
      "Southall offers a diverse mix of rental properties, including Victorian terraces and modern flats. The average renting price for a one-bedroom apartment ranges from £1,000 to £1,300 per month. It attracts a diverse range of residents, including families, professionals, and individuals who value the multicultural community, transport links, and affordable housing options.",
  },
  {
    name: "Notting Hill Gate",
    coords: { lat: 51.5091, lng: -0.1961 },
    generalinfo:
      "Notting Hill Gate, located in the Royal Borough of Kensington and Chelsea, is a trendy and cosmopolitan district. It is known for its vibrant Portobello Road Market, which offers a variety of antiques, fashion, and street food. The area is characterized by colorful Victorian townhouses and picturesque garden squares. Notting Hill Gate appeals to residents who enjoy a bohemian atmosphere, trendy boutiques, and eclectic dining options. The district is served by schools such as Colville Primary School and Wetherby School, and residents have access to healthcare facilities like the Bupa Cromwell Hospital.",
    priceinfo:
      "Notting Hill Gate features Georgian townhouses, mansion flats, and modern apartments. The average renting price for a one-bedroom apartment ranges from £1,800 to £2,500 per month. It appeals to professionals and families who are drawn to the vibrant atmosphere, fashionable shops, trendy restaurants, and the famous Portobello Road Market.",
  },
  {
    name: "Embankment",
    coords: { lat: 51.5073, lng: -0.1223 },
    generalinfo:
      "Embankment is a central London district situated along the northern bank of the River Thames. It is known for its iconic landmarks, including the Houses of Parliament, Big Ben, and the London Eye. The area offers stunning views of the river and is popular among tourists and residents alike. Embankment appeals to individuals seeking a convenient location with easy access to cultural attractions, theaters, and dining options. The district is well-connected, with several tube lines converging at the Embankment station. Residents have access to amenities such as schools like St. Matthew's Primary School and healthcare facilities including St. Thomas' Hospital.",
    priceinfo:
      "Embankment offers luxury apartments and converted period buildings. The average renting price for a one-bedroom apartment ranges from £1,900 to £2,500 per month. It is popular among professionals and couples who appreciate the central location, stunning views of the River Thames, and proximity to major attractions and cultural landmarks.",
  },
  {
    name: "Westminster",
    coords: { lat: 51.501, lng: -0.1247 },
    generalinfo:
      "Westminster, located in central London, is the political and cultural heart of the city. It is home to famous landmarks such as Westminster Abbey, the Houses of Parliament, and Buckingham Palace. The district offers a mix of historic charm and modern amenities. Westminster appeals to those interested in history, politics, and the arts. Residents can enjoy the serene atmosphere of St. James's Park and the vibrant ambiance of Covent Garden. The area is served by schools such as Westminster School and Grey Coat Hospital, and healthcare facilities like St. Thomas' Hospital.",
    priceinfo:
      "Westminster features modern apartments and period conversions. The average renting price for a one-bedroom apartment ranges from £2,000 to £3,000 per month. It attracts professionals, politicians, and individuals who value the central location, historic surroundings, and easy access to government institutions and cultural sites.",
  },
  {
    name: "Mile End",
    coords: { lat: 51.5255, lng: -0.0335 },
    generalinfo:
      "Mile End is a vibrant and diverse district situated in East London. The area is home to Queen Mary University of London, attracting students and academics. Mile End Park provides residents with green spaces, sports facilities, and a vibrant arts pavilion. The district offers a variety of shops, cafes, and restaurants, catering to different tastes and cultures. Mile End appeals to a young and dynamic demographic, with its vibrant community spirit and easy access to the vibrant nightlife of nearby Shoreditch. Schools in the area include Cayley Primary School, while healthcare needs can be met at Mile End Hospital.",
    priceinfo:
      "Mile End offers purpose-built flats and converted houses. The average renting price for a one-bedroom apartment ranges from £1,300 to £1,700 per month. It appeals to students, young professionals, and families who appreciate the affordable housing options, nearby universities, and the lively atmosphere of the East End.",
  },
  {
    name: "Liverpool Street",
    coords: { lat: 51.5178, lng: -0.0825 },
    generalinfo:
      "Liverpool Street is a bustling district in the City of London, known as one of London's major financial and business hubs. The area offers a mix of modern office buildings, historic architecture, and trendy eateries. Liverpool Street Station is a major transportation hub, connecting residents to various parts of the city and beyond. The district appeals to professionals working in the finance and tech industries, as well as those seeking convenient commuting options. Liverpool Street offers a range of amenities, including shops, cafes, and restaurants. Healthcare facilities in the vicinity include The London Clinic and The Royal London Hospital.",
    priceinfo:
      "Liverpool Street features modern apartments and warehouse conversions. The average renting price for a one-bedroom apartment ranges from £1,900 to £2,500 per month. It is popular among city workers, young professionals, and individuals who value the convenient transport links, proximity to the financial district, and vibrant nightlife.",
  },
  {
    name: "King's Cross St. Pancras",
    coords: { lat: 51.5308, lng: -0.1233 },
    generalinfo:
      "King's Cross St. Pancras is a vibrant and bustling district in central London. It is known for its major transportation hubs, including King's Cross Station and St. Pancras International, providing access to national and international travel. The area has undergone significant redevelopment in recent years, resulting in modern office buildings, trendy bars, and restaurants. King's Cross St. Pancras appeals to professionals, students, and international travelers. The district offers a range of amenities, including shops, markets, and cultural venues. Schools in the area include The King's Cross Academy, and residents have access to healthcare facilities such as St. Pancras Hospital and UCLH University College Hospital.",
    priceinfo:
      "King's Cross St. Pancras offers a range of rental options, including modern apartments, warehouse conversions, and period buildings. The average renting price for a one-bedroom apartment ranges from £1,800 to £2,500 per month. It attracts a diverse mix of professionals, students, and individuals who appreciate the excellent transport links, vibrant atmosphere, and proximity to major universities and cultural attractions.",
  },
  {
    name: "Euston",
    coords: { lat: 51.5281, lng: -0.1336 },
    generalinfo:
      "Euston is a vibrant district in central London, known for its major railway station and proximity to notable institutions such as University College London (UCL) and the British Library. The area appeals to students, academics, and professionals in various fields. Euston offers a mix of residential and commercial spaces, with a range of amenities including shops, cafes, and restaurants. Residents can enjoy the nearby green spaces of Regent's Park and Bloomsbury Square Gardens. Schools in the area include Regent High School and St. Aloysius' College, while healthcare needs can be met at UCLH University College Hospital.",
    priceinfo:
      "Euston features a mix of rental properties, including modern flats and period conversions. The average renting price for a one-bedroom apartment ranges from £1,700 to £2,300 per month. It appeals to professionals, students, and individuals who value the central location, excellent transport connections, and proximity to major universities and employment hubs.",
  },
  {
    name: "Ealing Broadway",
    coords: { lat: 51.5142, lng: -0.3012 },
    generalinfo:
      "Ealing Broadway is a suburban district in West London, offering a blend of residential tranquility and vibrant town center. The area is known for its beautiful parks, such as Ealing Common and Walpole Park, providing ample opportunities for outdoor activities. Ealing Broadway appeals to families and professionals seeking a peaceful neighborhood with good transport links. The district offers a range of amenities, including a variety of shops, restaurants, and cafes. Schools in the area include Twyford Church of England High School and Durston House School, while healthcare facilities like Ealing Hospital can cater to residents' medical needs.",
    priceinfo:
      "Ealing Broadway offers a variety of rental options, including period conversions, modern apartments, and townhouses. The average renting price for a one-bedroom apartment ranges from £1,300 to £1,800 per month. It attracts a mix of professionals, families, and students who appreciate the suburban feel, green spaces, and good transport links.",
  },
  {
    name: "Waterloo",
    coords: { lat: 51.5036, lng: -0.1143 },
    generalinfo:
      "Waterloo is a dynamic district in central London, famous for its iconic Waterloo Station and its proximity to the South Bank. The area offers an array of cultural attractions, including the National Theatre, the British Film Institute (BFI), and the London Eye. Waterloo appeals to individuals who enjoy a vibrant arts scene, riverside walks, and diverse dining options. The district provides convenient access to both the West End and the City. Residents can enjoy the green spaces of Jubilee Gardens and the bustling atmosphere of Lower Marsh Market. Schools in the vicinity include Oasis Academy Johanna and St. Jude's Church of England Primary School, while healthcare needs can be met at St. Thomas' Hospital.",
    priceinfo:
      "Waterloo boasts modern apartments, converted warehouses, and period buildings. The average renting price for a one-bedroom apartment ranges from £1,800 to £2,500 per month. It appeals to professionals, artists, and individuals who value the central location, cultural institutions, and proximity to the South Bank and Thames River.",
  },
  {
    name: "Stratford",
    coords: { lat: 51.5416, lng: -0.0034 },
    generalinfo:
      "Stratford is an East London district that has undergone significant redevelopment, particularly due to its role as the host of the 2012 Olympic Games. The area offers a mix of residential, commercial, and recreational spaces. Stratford is home to Westfield Stratford City, one of the largest urban shopping centers in Europe, as well as the Queen Elizabeth Olympic Park, which provides ample opportunities for sports and outdoor activities. The district appeals to young professionals, families, and sports enthusiasts. Stratford offers a range of amenities, including shops, restaurants, and entertainment venues. Schools in the area include Chobham Academy and Sarah Bonnell School, while healthcare facilities like Stratford Village Surgery cater to residents' medical needs.",
    priceinfo:
      "Stratford offers a mix of rental properties, including modern apartments and converted industrial spaces. The average renting price for a one-bedroom apartment ranges from £1,300 to £1,800 per month. It attracts professionals, families, and students who appreciate the excellent transport links, Olympic Park, and Westfield shopping center.",
  },
  {
    name: "Goodmayes",
    coords: { lat: 51.5655, lng: 0.1101 },
    generalinfo:
      "Goodmayes is a residential suburb located in the London Borough of Redbridge. The area offers a peaceful and family-friendly environment, characterized by a mix of Victorian and modern properties. Goodmayes appeals to individuals seeking a quieter suburban lifestyle within easy reach of central London. The district provides convenient access to Goodmayes Park, offering green spaces and recreational facilities. Residents can enjoy a range of amenities, including shops, supermarkets, and restaurants. Schools in the area include Goodmayes Primary School and Mayfield School, while healthcare needs can be met at Goodmayes Medical Practice and King George Hospital.",
    priceinfo:
      "Goodmayes features a mix of rental properties, including terraced houses, apartments, and maisonettes. The average renting price for a one-bedroom apartment ranges from £900 to £1,200 per month. It appeals to families, young professionals, and individuals who seek affordable accommodation in a suburban setting.",
  },
  {
    name: "Putney Bridge",
    coords: { lat: 51.4686, lng: -0.2081 },
    generalinfo:
      "Putney Bridge is a picturesque district located in southwest London, situated along the southern bank of the River Thames. The area is known for its stunning views of the river and its vibrant rowing community. Putney Bridge appeals to residents who enjoy a blend of natural beauty and urban convenience. The district offers a variety of amenities, including charming cafes, boutique shops, and riverside pubs. Residents can explore the nearby Putney Heath and enjoy leisurely walks along the Thames Path. Putney Bridge is served by schools such as Brandlehow Primary School and Putney High School, while healthcare needs can be met at Putney Medical Centre.",
    priceinfo:
      "Putney Bridge offers a range of rental options, including Victorian terraces, period conversions, and modern flats. The average renting price for a one-bedroom apartment ranges from £1,500 to £2,000 per month. It attracts professionals, families, and students who appreciate the riverside location, green spaces, and easy access to amenities.",
  },
  {
    name: "Wembley Park",
    coords: { lat: 51.5632, lng: -0.2797 },
    generalinfo:
      "Wembley Park is a lively district located in northwest London, renowned for its world-famous Wembley Stadium and Wembley Arena. The area attracts sports enthusiasts, concert-goers, and those seeking a vibrant atmosphere. Wembley Park offers a range of amenities, including a large shopping center, designer outlets, and diverse dining options. The district is also home to the London Designer Outlet, providing a unique shopping experience. Residents can enjoy the green spaces of nearby Fryent Country Park and King Edward VII Park. Schools in the area include Wembley High Technology College and Ark Elvin Academy, while healthcare facilities like Wembley Park Medical Centre cater to residents' medical needs.",
    priceinfo:
      "Wembley Park boasts modern apartments, purpose-built flats, and residential complexes. The average renting price for a one-bedroom apartment ranges from £1,200 to £1,600 per month. It appeals to professionals, young couples, and students who value the excellent transport links, Wembley Stadium, and the London Designer Outlet.",
  },
  {
    name: "Rayners Lane",
    coords: { lat: 51.5754, lng: -0.3712 },
    generalinfo:
      "Rayners Lane is a suburban district located in northwest London, offering a mix of residential tranquility and convenient amenities. The area is known for its multicultural community and diverse range of shops and eateries. Rayners Lane appeals to families and professionals seeking a peaceful residential area with easy access to central London. The district offers a range of amenities, including supermarkets, local shops, and restaurants. Residents can enjoy the nearby green spaces of Roxbourne Park and Pinner Memorial Park. Schools in the vicinity include Roxbourne Primary School and Whitchurch Primary School, while healthcare needs can be met at Rayners Lane Medical Centre.",
    priceinfo:
      "Rayners Lane offers a mix of rental properties, including terraced houses, apartments, and maisonettes. The average renting price for a one-bedroom apartment ranges from £1,000 to £1,300 per month. It attracts families, professionals, and individuals who appreciate the suburban feel, good schools, and transport links.",
  },
  {
    name: "Gunnersbury",
    coords: { lat: 51.4917, lng: -0.2753 },
    generalinfo:
      "Gunnersbury is a leafy district located in West London, known for its historic Gunnersbury Park and the Gunnersbury Museum. The area offers a blend of residential charm and parkland beauty. Gunnersbury appeals to individuals and families seeking a peaceful neighborhood with a strong community spirit. The district provides access to a range of amenities, including local shops, cafes, and restaurants. Residents can enjoy the tranquil surroundings of Gunnersbury Park, which offers beautiful gardens and sports facilities. Schools in the area include Gunnersbury Catholic School and The Falcons Pre-Preparatory School for Boys, while healthcare facilities like Chiswick Health Practice cater to residents' medical needs.",
    priceinfo:
      "Gunnersbury features a range of rental options, including period conversions, modern flats, and townhouses. The average renting price for a one-bedroom apartment ranges from £1,400 to £1,900 per month. It appeals to professionals, families, and individuals who seek a suburban atmosphere, green spaces, and good transport connections.",
  },
  {
    name: "Wimbledon",
    coords: { lat: 51.4213, lng: -0.2067 },
    generalinfo:
      "Wimbledon is a prestigious district in southwest London, renowned for its world-famous tennis championships. The area offers a combination of residential tranquility, green spaces, and a vibrant town center. Wimbledon appeals to residents who appreciate a blend of upscale living and cultural amenities. The district features a range of amenities, including high-end shops, gourmet restaurants, and charming cafes. Residents can explore the expansive Wimbledon Common and enjoy leisurely walks in Cannizaro Park. Schools in the area include Wimbledon High School and King's College School, while healthcare needs can be met at Nelson Medical Practice and Wimbledon Medical Practice.",
    priceinfo:
      "Wimbledon offers a mix of rental properties, including period conversions, modern flats, and townhouses. The average renting price for a one-bedroom apartment ranges from £1,500 to £2,100 per month. It attracts professionals, families, and tennis enthusiasts who appreciate the green surroundings, prestigious reputation, and excellent amenities.",
  },
  {
    name: "Stockwell",
    coords: { lat: 51.4722, lng: -0.1226 },
    generalinfo:
      "Stockwell is a diverse and vibrant district located in South London, known for its multicultural community and excellent transport links. The area offers a mix of residential properties, independent shops, and local markets. Stockwell appeals to a diverse range of residents, including young professionals and families. The district provides convenient access to central London and boasts a thriving culinary scene with a variety of international cuisines. Residents can enjoy the green spaces of Larkhall Park and Myatt's Fields Park. Schools in the vicinity include Stockwell Primary School and Lilian Baylis Technology School, while healthcare facilities like Stockwell Gardens Medical Centre cater to residents' medical needs.",
    priceinfo:
      "Stockwell features a range of rental options, including Victorian terraces, modern apartments, and purpose-built flats. The average renting price for a one-bedroom apartment ranges from £1,300 to £1,800 per month. It appeals to professionals, students, and young couples who value the convenient location, transport links, and diverse community.",
  },
  {
    name: "Greenwich",
    coords: { lat: 51.4781, lng: -0.0148 },
    generalinfo:
      "Greenwich is a historic district located in southeast London, known for its rich maritime heritage and its inclusion in the UNESCO World Heritage Site list. The area offers a unique blend of historical landmarks, beautiful parkland, and a bustling town center. Greenwich appeals to history enthusiasts, families, and those seeking a vibrant and culturally significant neighborhood. The district features a range of amenities, including markets, boutique shops, and riverside pubs. Residents can explore iconic attractions like the Cutty Sark, the Royal Observatory, and Greenwich Park. Schools in the area include Millennium Primary School and St. Ursula's Convent School, while healthcare needs can be met at Greenwich Health Centre and Greenwich Dental Health.",
    priceinfo:
      "Greenwich offers a mix of rental properties, including period conversions, modern apartments, and townhouses. The average renting price for a one-bedroom apartment ranges from £1,500 to £2,100 per month. It attracts professionals, families, and individuals who appreciate the historic surroundings, maritime heritage, and access to parks and open spaces.",
  },
  {
    name: "Walthamstow Central",
    coords: { lat: 51.5822, lng: -0.0197 },
    generalinfo:
      "Walthamstow Central is a vibrant district located in East London, known for its lively street markets, creative arts scene, and easy access to green spaces. The area appeals to young professionals, families, and artists seeking an eclectic and diverse neighborhood. Walthamstow Central offers a range of amenities, including a variety of shops, independent boutiques, and trendy cafes. Residents can explore the vibrant Walthamstow Village and enjoy the outdoor spaces of Lloyd Park and Walthamstow Marshes. Schools in the vicinity include Walthamstow School for Girls and Willowfield Humanities College, while healthcare facilities like Walthamstow Central Medical Centre cater to residents' medical needs.",
    priceinfo:
      "Walthamstow Central features a mix of rental properties, including Victorian terraces, modern apartments, and maisonettes. The average renting price for a one-bedroom apartment ranges from £1,200 to £1,600 per month. It appeals to professionals, young families, and individuals who seek affordable accommodation, a vibrant community, and good transport connections.",
  },
];

function App() {
  const [cookies, setCookie] = useCookies([
    "location",
    "prev",
    "prevprev",
    "lat",
    "long",
  ]);
  const [libraries] = useState(["places"]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(/** @type google.maps.Map */ null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  //for side bar
  const [isOpen, setIsOpen] = useState(false);

  function turnOn() {
    setIsOpen((isOpen) => true);
  }

  function turnOff() {
    setIsOpen((isOpen) => false);
  }

  // Track the circles added to the map
  const [circles, setCircles] = useState([]);

  //for markers
  const [id, setId] = useState(0);
  const [markers, setMarkers] = useState([]);

  const [generalText, setGeneralText] = useState("Next");
  const [infoText, setInfoText] = useState("Info");
  const [title, setTitle] = useState("Title");
  const changeGeneralText = (text) => setGeneralText(text);
  const changeInfoText = (text) => setInfoText(text);
  const changeTitle = (text) => setTitle(text);

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

  async function placeMarkerWithHistory() {
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
          if (cookies.prevprev != null && cookies.prev != null) {
            setCookie("prevprev", cookies.prev, { path: "/" });
            setCookie("prev", cookies.location, { path: " / " });
          } else if (cookies.prevprev == null && cookies.prev != null) {
            setCookie("prevprev", cookies.prev, { path: "/" });
            setCookie("prev", cookies.location, { path: "/" });
          } else if (cookies.prev == null && cookies.location != null) {
            setCookie("prev", cookies.location, { path: "/" });
          }
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
          var geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { address: origin },
            async function (results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                const originCoord = {
                  lat: results[0].geometry.location.lat(),
                  lng: results[0].geometry.location.lng(),
                };
                placeCircle(originCoord, avgWalkingSpeed * commuteTime, true);
              }
            }
          );

          for (let i = 0; i < tubeStations.length; i++) {
            const tubeStation = tubeStations[i];
            if (result.rows[0].elements[i].duration.value < commuteTime) {
              placeCircle(
                tubeStation.coords,
                avgWalkingSpeed *
                  (commuteTime - result.rows[0].elements[i].duration.value),
                false
              );
            } else {
              console.log("No stations in commuting distance");
            }
          }
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  }

  // Places a circle on the map with the given center and radius
  async function placeCircle(center, radius, walkingFlag) {
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
    // Add a listener for when the circle is clicked
    circle.addListener("click", function () {
      turnOn();
      if (walkingFlag == true) {
        changeTitle("Walking only route");
        changeGeneralText("");
        changeInfoText("");
      } else {
        for (var i = 0; tubeStations[i]; i++) {
          if (tubeStations[i].coords == center) {
            changeTitle(tubeStations[i].name);
            changeGeneralText(tubeStations[i].generalinfo);
            changeInfoText(tubeStations[i].priceinfo);
          }
        }
      }
    });
    // Add the circle to the circles state
    setCircles((prevCircles) => [...prevCircles, circle]);
  }

  async function placePrevMarker() {
    const temp = originRef.current.value;
    originRef.current.value = cookies.prev;
    setCookie("prev", temp, { path: "/" });
    placeMarkerWithHistory();
  }

  async function placePrevPrevMarker() {
    setCookie("prevprev", cookies.prev, { path: "/" });
    const temp = cookies.prevprev;
    setCookie("prev", originRef.current.value, { path: "/" });
    originRef.current.value = temp;
    placeMarkerWithHistory();
  }

  // Clear all circles from the map
  function clearCircles() {
    // Remove each circle from the map
    circles.forEach((circle) => circle.setMap(null));

    // Clear the circles state
    setCircles([]);
  }

  async function onMapClick(coord) {
    //will store text location, lat, long all as strings
    if (cookies.prevprev != null && cookies.prev != null) {
      setCookie("prevprev", cookies.prev, { path: "/" });
      setCookie("prev", cookies.location, { path: " / " });
    } else if (cookies.prevprev == null && cookies.prev != null) {
      setCookie("prevprev", cookies.prev, { path: "/" });
      setCookie("prev", cookies.location, { path: "/" });
    } else if (cookies.prev == null && cookies.location != null) {
      setCookie("prev", cookies.location, { path: "/" });
    }
    setCookie("location", coord.lat + " " + coord.lng, { path: "/" });
    setCookie("lat", coord.lat, { path: "/" });
    setCookie("long", coord.lng, { path: "/" });
    clearCircles();
    setMarkers([]);
    addMarker(coord);
    const directionsService = new google.maps.DistanceMatrixService();
    await directionsService.getDistanceMatrix(
      {
        origins: [coord],
        destinations: tubeStations.map((station) => station.coords),
        travelMode: google.maps.TravelMode.TRANSIT,
      },
      (result, status) => {
        if (status === "OK") {
          placeCircle(coord, avgWalkingSpeed * commuteTime, true);
          for (let i = 0; i < tubeStations.length; i++) {
            const tubeStation = tubeStations[i];
            if (result.rows[0].elements[i].duration.value < commuteTime) {
              placeCircle(
                tubeStation.coords,
                avgWalkingSpeed *
                  (commuteTime - result.rows[0].elements[i].duration.value),
                false
              );
            } else {
              console.log("No stations in commuting distance");
            }
          }
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  }

  return (
    <CookiesProvider>
      <Flex
        position="relative"
        flexDirection="row"
        alignItems="flex-start"
        h="100vh"
        w="100vw"
      >
        {isOpen && (
          <Box bg="white" w="400px" p={4} position="relative">
            <IconButton
              icon={<RxCrossCircled />}
              fontSize="25px"
              position="absolute"
              bg="white"
              color="#cf0083"
              top={1}
              right={1}
              zIndex={1}
              padding={"3px"}
              onClick={turnOff}
            ></IconButton>
            <HStack>
            <Icon as={TubeLogo} 
                boxSize={10} 
                height={10}
                />
            <Text>{title}</Text>
            </HStack>
            <br></br>
            <Text fontSize="13.5px">{generalText}</Text>
            <br></br>
            <Text fontSize="13.5px">{infoText}</Text>
          </Box>
        )}
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
              onClick={(e) => onMapClick(e.latLng.toJSON())}
              center={center}
              zoom={12}
              mapContainerStyle={{ width: "100%", height: "100%" }}
              options={{
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
              onLoad={async (map) => {
                setMap(map);
                let coord = {
                  lat: Number(cookies.lat),
                  lng: Number(cookies.long),
                };
                clearCircles();
                setMarkers([]);
                addMarker(coord);
                const directionsService =
                  new google.maps.DistanceMatrixService();
                await directionsService.getDistanceMatrix(
                  {
                    origins: [coord],
                    destinations: tubeStations.map((station) => station.coords),
                    travelMode: google.maps.TravelMode.TRANSIT,
                  },
                  async (result, status) => {
                    if (status === "OK") {
                      var circle = new google.maps.Circle({
                        strokeColor: "#FF0000",
                        strokeOpacity: 0.8,
                        strokeWeight: 0,
                        fillColor: "#FF0000",
                        fillOpacity: 0.15,
                        map,
                        center: coord,
                        radius: avgWalkingSpeed * commuteTime,
                      });
                      // Add the circle to the circles state
                      setCircles((prevCircles) => [...prevCircles, circle]);

                      for (let i = 0; i < tubeStations.length; i++) {
                        const tubeStation = tubeStations[i];
                        if (
                          result.rows[0].elements[i].duration.value <
                          commuteTime
                        ) {
                          var circle = new google.maps.Circle({
                            strokeColor: "#FF0000",
                            strokeOpacity: 0.8,
                            strokeWeight: 0,
                            fillColor: "#FF0000",
                            fillOpacity: 0.15,
                            map,
                            center: tubeStation.coords,
                            radius:
                              avgWalkingSpeed *
                              (commuteTime -
                                result.rows[0].elements[i].duration.value),
                          });
                          // Add the circle to the circles state
                          setCircles((prevCircles) => [...prevCircles, circle]);
                        }
                      }
                    } else {
                      console.error(`error fetching directions ${result}`);
                    }
                  }
                );
              }}
            >
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
              <Stack direction={["column"]} spacing="7px">
                <Text> Location: {cookies.location} </Text>
                {cookies.prev && (
                  <Text fontSize="14px" color="grey">
                    Previous searches:
                  </Text>
                )}
                {cookies.prev && (
                  <Stack direction={["row"]} spacing="5px">
                    <Button
                      size="xs"
                      colorScheme="pink"
                      variant="outline"
                      onClick={placePrevMarker}
                    >
                      {cookies.prev}
                    </Button>
                    {cookies.prevprev && (
                      <Button
                        size="xs"
                        colorScheme="pink"
                        variant="outline"
                        onClick={placePrevPrevMarker}
                      >
                        {cookies.prevprev}
                      </Button>
                    )}
                  </Stack>
                )}
              </Stack>
            </HStack>
          </Box>
        </Flex>
      </Flex>
    </CookiesProvider>
  );
}

export default App;
