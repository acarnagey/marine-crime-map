import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { useEffect, useRef } from "react";

import route from "../data/route";
import yellowMarker from "../svg/mapbox-marker-icon-yellow.svg";
import orangeMarker from "../svg/mapbox-marker-icon-orange.svg";
import blueMarker from "../svg/mapbox-marker-icon-blue.svg";
import redMarker from "../svg/mapbox-marker-icon-red.svg";
import purpleMarker from "../svg/mapbox-marker-icon-purple.svg";

const getSeverity = (r) => {
  switch (r[3]) {
    case "media/com_fabrik/images/purple-dot.png":
      return 1;
    case "media/com_fabrik/images/orange-dot.png":
      return 2;
    case "media/com_fabrik/images/yellow-dot.png":
      return 3;
    case "media/com_fabrik/images/blue-dot.png":
      return 4;
    case "media/com_fabrik/images/red-dot.png":
      return 5;
    default:
      return 0;
  }
};

const reportsToGeoJson = (list) => {
  const features = list.map((r) => ({
    type: "Feature",
    properties: {
      description: r[2],
      icon: r[3],
      severity: getSeverity(r),
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

const Map = ({ reports, layerType }) => {
  console.log(reports.length);
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    // https://docs.mapbox.com/mapbox-gl-js/example/toggle-layers/
    if (map.current) {
      if (
        !map.current.getLayer("piracy-report") ||
        !map.current.getLayer("report-heat")
      ) {
        return;
      }
      if (layerType === "symbol") {
        map.current.setLayoutProperty("piracy-report", "visibility", "visible");
        map.current.setLayoutProperty("report-heat", "visibility", "none");
      } else {
        map.current.setLayoutProperty("report-heat", "visibility", "visible");
        map.current.setLayoutProperty("piracy-report", "visibility", "none");
      }
    }
  }, [layerType]);

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
            visibility: "visible",
            "icon-image": ["get", "icon"],
            "icon-allow-overlap": true,
          },
        });
        // https://docs.mapbox.com/mapbox-gl-js/example/heatmap-layer/
        map.current.addLayer(
          {
            id: "report-heat",
            type: "heatmap",
            source: "piracy-report",
            layout: {
              visibility: "none",
            },
            maxzoom: 9,
            paint: {
              // Increase the heatmap weight based on frequency and property magnitude
              "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "severity"],
                0,
                0,
                5,
                1,
              ],
              // Increase the heatmap color weight weight by zoom level
              // heatmap-intensity is a multiplier on top of heatmap-weight
              "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                1,
                9,
                3,
              ],
              // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
              // Begin color ramp at 0-stop with a 0-transparancy color
              // to create a blur-like effect.
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(33,102,172,0)",
                0.2,
                "rgb(103,169,207)",
                0.4,
                "rgb(209,229,240)",
                0.6,
                "rgb(253,219,199)",
                0.8,
                "rgb(239,138,98)",
                1,
                "rgb(178,24,43)",
              ],
              // Adjust the heatmap radius by zoom level
              "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                2,
                9,
                20,
              ],
              // Transition from heatmap to circle layer by zoom level
              "heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7,
                1,
                9,
                0,
              ],
            },
          },
          "waterway-label"
        );
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
