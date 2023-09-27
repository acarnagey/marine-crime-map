import { Text } from "@chakra-ui/react";

import yellowMarker from "../svg/mapbox-marker-icon-yellow.svg";
import orangeMarker from "../svg/mapbox-marker-icon-orange.svg";
import blueMarker from "../svg/mapbox-marker-icon-blue.svg";
import redMarker from "../svg/mapbox-marker-icon-red.svg";
import purpleMarker from "../svg/mapbox-marker-icon-purple.svg";

const Legend = () => (
  <div
    style={{
      margin: "1rem 0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      columnGap: "25px",
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img src={yellowMarker} alt="yellow" width="20" height="48" />
      <Text>Attempted Attack</Text>
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img src={orangeMarker} alt="orange" width="20" height="48" />
      <Text>Boarded</Text>
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img src={blueMarker} alt="blue" width="20" height="48" />
      <span>Fired upon</span>
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img src={redMarker} alt="red" width="20" height="48" />
      <span>Hijacked</span>
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img src={purpleMarker} alt="purple" width="20" height="48" />
      <span>Suspicious vessel</span>
    </div>
  </div>
);

export default Legend;
