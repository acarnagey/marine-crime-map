import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { useEffect, useRef } from "react";

import route from "../data/route";
import yellowMarker from "../svg/mapbox-marker-icon-yellow.svg";
import orangeMarker from "../svg/mapbox-marker-icon-orange.svg";
import blueMarker from "../svg/mapbox-marker-icon-blue.svg";
import redMarker from "../svg/mapbox-marker-icon-red.svg";
import purpleMarker from "../svg/mapbox-marker-icon-purple.svg";

const Map = ({ reports }) => {
  console.log(reports.length);
  const mapContainer = useRef(null);
  const map = useRef(null);

  const reportsToGeoJson = (list) => {
    const features = list.map((r) => ({
      type: "Feature",
      properties: {
        description: r[2],
        icon: r[3],
      },
      geometry: {
        type: "Point",
        coordinates: [Number(r[1]), Number(r[0])],
      },
    }));
    return {
      type: "FeatureCollection",
      features,
    };
  };

  useEffect(() => {
    if (map.current) {
      if (map.current.getSource("piracy-report")) {
        map.current
          .getSource("piracy-report")
          .setData(reportsToGeoJson(reports));
      }
    } else {
      // initialize map only once
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
          {
            name: "media/com_fabrik/images/yellow-dot.png",
            label: "attempted-attack",
            src: yellowMarker,
          },
          {
            name: "media/com_fabrik/images/orange-dot.png",
            label: "boarded",
            src: orangeMarker,
          },
          {
            name: "media/com_fabrik/images/blue-dot.png",
            label: "fired-upon",
            src: blueMarker,
          },
          {
            name: "media/com_fabrik/images/red-dot.png",
            label: "hijacked",
            src: redMarker,
          },
          {
            name: "media/com_fabrik/images/purple-dot.png",
            label: "suspicious-vessel",
            src: purpleMarker,
          },
        ];
        for (const imageType of imageTypes) {
          const image = new Image(20, 48);
          image.src = imageType.src;
          map.current.addImage(imageType.name, image);
        }

        map.current.addSource("piracy-report", {
          type: "geojson",
          data: reportsToGeoJson(reports),
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
    }
  }, [reports]);

  return <div ref={mapContainer} className="map-container" />;
};

export default Map;
