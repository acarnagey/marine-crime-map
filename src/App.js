import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { useEffect, useRef } from "react";

// http://ports.com/sea-route/#/?a=16182&b=15581&c=Perim%20Harbour%20,%20Yemen&d=Jinan%20Port%20(Chinan%20/Tsinan),%20China
import route from "./route.json";
// https://icc-ccs.org/piracy-reporting-centre/live-piracy-map
import piracyReports from "./piracy-report.json";
import "./App.css";
import yellowMarker from "./mapbox-marker-icon-yellow.svg";
import orangeMarker from "./mapbox-marker-icon-orange.svg";
import blueMarker from "./mapbox-marker-icon-blue.svg";
import redMarker from "./mapbox-marker-icon-red.svg";
import purpleMarker from "./mapbox-marker-icon-purple.svg";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX;

const App = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [83.24316735223056, 21.691865739539494],
      zoom: 2.310934066772461,
      projection: "naturalEarth",
      // interactive: false,
    });
    map.current.on("load", () => {
      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: route,
          },
        },
      });
      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#FF0",
          "line-width": 4,
        },
      });
      const imageTypes = [
        { name: "attempted-attack", src: yellowMarker },
        { name: "boarded", src: orangeMarker },
        { name: "fired-upon", src: blueMarker },
        { name: "hijacked", src: redMarker },
        { name: "suspicious-vessel", src: purpleMarker },
      ];
      for (const imageType of imageTypes) {
        const image = new Image(20, 48);
        image.src = imageType.src;
        map.current.addImage(imageType.name, image);
      }

      const piracyReportFeatures = piracyReports.map((pr) => ({
        type: "Feature",
        properties: {
          description: `<strong>${pr.id}</strong><p>${pr.sitrep}</p><p>${pr.report}</p>`,
          icon: pr.type,
        },
        geometry: {
          type: "Point",
          coordinates: pr.coord,
        },
      }));
      map.current.addSource("piracy-report", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: piracyReportFeatures,
        },
      });

      map.current.addLayer({
        id: "piracy-report",
        type: "symbol",
        source: "piracy-report",
        layout: {
          "icon-image": ["get", "icon"],
          "icon-allow-overlap": true,
        },
      });
      map.current.on("click", "piracy-report", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(map.current);
      });
      map.current.on("mouseenter", "piracy-report", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "piracy-report", () => {
        map.current.getCanvas().style.cursor = "";
      });
      map.current.addControl(new mapboxgl.FullscreenControl());
      map.current.addControl(new mapboxgl.NavigationControl());

    });
  });

  return (
    <div style={{ margin: "1rem" }}>
      <h1>Piracy Map '21 - '23 South China Sea - Yemen</h1>
      <div ref={mapContainer} className="map-container" />
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
          <span>Attempted Attack</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img src={orangeMarker} alt="orange" width="20" height="48" />
          <span>Boarded</span>
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
    </div>
  );
};

export default App;
