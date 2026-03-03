// import React , {useLayoutEffect, useEffect,useRef,useState} from "react";
// import maplibregl from 'maplibre-gl';
// import "../styles/map.css";
// //import { type } from "@testing-library/user-event/dist/type";

// const MapView = ()=>{

//     const mapContainer = useRef(null);
//     const mapRef = useRef(null);
//     const[source,setSource]= useState(null);
//     const[destination,setDestination] = useState(null);
//     const[routeInfo,setRouteInfo]= useState(null);
//     useLayoutEffect(() => {
//         mapRef.current = new maplibregl.Map({
//           container: mapContainer.current,
//           style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
//           center: [77.5946, 12.9716],
//           zoom: 11
//         });

//         mapRef.current.addControl(new maplibregl.NavigationControl());

//         mapRef.current.on("click", (e) => {
//           const coords = [e.lngLat.lng, e.lngLat.lat];

//           if (!source) {
//             setSource(coords);
//             new maplibregl.Marker({ color: "green" })
//               .setLngLat(coords)
//               .addTo(mapRef.current);
//           } else if (!destination) {
//             setDestination(coords);
//             new maplibregl.Marker({ color: "red" })
//               .setLngLat(coords)
//               .addTo(mapRef.current);
//           }
//   });

//   return () => mapRef.current.remove();
// }, []);

//   // Draw route
//   useEffect(() => {
//     if (!source || !destination) return;

//     const fetchRoute = async () => {
//       const url = `https://router.project-osrm.org/route/v1/driving/${source.join(",")};${destination.join(",")}?overview=full&geometries=geojson`;
//       const res = await fetch(url);
//       const data = await res.json();
//       const routeData = data.routes[0];

//       setRouteInfo({
//         distance: (routeData.distance / 1000).toFixed(2), // km
//         duration: (routeData.duration / 60).toFixed(1)    // minutes
//       });
//       const route = routeData.geometry;

//       if (mapRef.current.getSource("route")) {
//         mapRef.current.getSource("route").setData({
//           type: "Feature",
//           geometry: route
//         });
//       } else {
//         mapRef.current.addSource("route", {
//           type: "geojson",
//           data: {
//             type: "Feature",
//             geometry: route
//           }
//         });

//         mapRef.current.addLayer({
//           id: "route-layer",
//           type: "line",
//           source: "route",
//           paint: {
//             "line-width": 6,
//             "line-color": "#2ecc71"
//           }
//         });
//       }
//     };

//     fetchRoute();
//   }, [source, destination]);

//   return(
//     <div className="map-wrapper">
//       <div ref={mapContainer} className="map-container" />
//       {routeInfo && (
//         <div className="route-info">
//           <strong>Distance:</strong>{routeInfo.distance}km <br />
//           <strong>ETA:</strong>{routeInfo.duration} mins
//         </div>
//       )}
//     </div>
//   ) 
// };
// export default MapView;
import { useLayoutEffect, useRef,useState,useEffect } from "react";
import maplibregl from "maplibre-gl";
import { fetchRouteOptions } from "../api/routeApi";
import "../styles/map.css";
import LocationSearch from "./LocationSearch";
import RouteOptions from "./RouteOptions";
import BottomBar from "./BottomBar";
import BottomSheet from "./BottomSheet";
import HistoryPanel from "./HistoryPanel";
import BookmarksPanel from "./BookmarksPanel";
import { saveBookmark } from "../api/bookmarkApi";
import { authFetch } from "../api/authFetch";
import { useAuth } from "../auth/AuthContext";
import { useCallback } from "react";
import { fetchPrediction } from "../api/aiApi";
import { fetchHotspots } from "../api/aiApi";

export default function MapView() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  const sourceRef = useRef(null);
  const destinationRef= useRef(null);
  const destinationMarkerRef = useRef(null);
  const [routes, setRoutes] = useState([]);
  const selectedRouteRef = useRef(null);
  const [activePanel, setActivePanel] = useState(null);
  const [aiAlert,setAiAlert] = useState(null);
  const activePanelRef = useRef(null);

  const {logout } = useAuth();
  function clearRoutes() {
  if (!mapRef.current) return;

  const style = mapRef.current.getStyle();
  if (!style || !style.layers) return;

  // 1️⃣ Remove route layers first
  style.layers.forEach((layer) => {
    if (layer.id.startsWith("route-layer-")) {
      if (mapRef.current.getLayer(layer.id)) {
        mapRef.current.removeLayer(layer.id);
      }
    }
  });

  // 2️⃣ Remove route sources next
  Object.keys(style.sources).forEach((sourceId) => {
    if (sourceId.startsWith("route-")) {
      if (mapRef.current.getSource(sourceId)) {
        mapRef.current.removeSource(sourceId);
      }
    }
  });
}

function setDestinationMarkerRef(coords){
  if(destinationMarkerRef.current){
    destinationMarkerRef.current.remove();
  }
  destinationMarkerRef.current=new maplibregl.Marker({color:"red"})
      .setLngLat(coords)
      .addTo(mapRef.current);
}
  async function drawRoutesFrontBackend(source,destination) {
  clearRoutes(); 
  const data = await fetchRouteOptions(source, destination);
  setRoutes(data.routes);
  if (!data || !data.routes || data.routes.length === 0) {
    console.error("No routes returned", data);
    return;
  }

  data.routes.forEach((route, index) => {
    drawTrafficRoute(route.geometry, route.trafficLevel, index);
  });
  drawAiHotspots();
  if(destinationRef.current){
    const[lng,lat] = destinationRef.current;
    fetchPrediction(lat,lng).then(data =>{
      setAiAlert("AI Forecast:" + data.prediction);
    });
  }
  
}
function buildHeatmapGeoJSON(hotspots){
  const features =[];
  Object.entries(hotspots).forEach(([routeKey,usage]) => {
    if(usage<3)return;
    const parts = routeKey.split("_");
    const lat = parseFloat(parts[2]);
    const lng = parseFloat(parts[3]);

    features.push({
      type: "Feature",
      properties: {
        intensity: usage
      },
      geometry: {
        type: "Point",
        coordinates: [lng, lat]
      }
    });
  });
  return{
    type:"FeatureCollection",
    features
  };
}
const drawAiHotspots = useCallback(async()=> {

  if(!mapRef.current) return;
  try{
    const hotspots = await fetchHotspots();
    const geojson = await buildHeatmapGeoJSON(hotspots);

    let matchedUsage = 0;
    Object.entries(hotspots).forEach(([routeKey,usage]) => {
      const parts = routeKey.split("_");
      const destLat = parseFloat(parts[2]);
      const destLng = parseFloat(parts[3]);
      if(
        destinationRef.current && 
        Math.abs(destLat-destinationRef.current[1])<0.01 &&
        Math.abs(destLng-destinationRef.current[0]<0.01)
      ){
        matchedUsage=usage;
      }
    });
    if(matchedUsage>=6){
      setAiAlert("High Traffic Alert in this area");
    }
    else if(matchedUsage>=3){
      setAiAlert("Traffic Heavy in this area");
    }
    else{
      setAiAlert(null);
    }
    if(mapRef.current.getLayer("ai-heat")){
      mapRef.current.removeLayer("ai-heat");

    }
    if(mapRef.current.getSource("ai-heat-source")){
      mapRef.current.removeSource("ai-heat-source");
    }
    mapRef.current.addSource("ai-heat-source",{
      type:"geojson",
      data:geojson
    });
    mapRef.current.addLayer({
      id:"ai-heat",
      type:"heatmap",
      source:"ai-heat-source",
      paint: {
          "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "intensity"],
          0, 0,
          10, 1
        ],
        "heatmap-intensity": 1.5,
        "heatmap-radius": 30,
        "heatmap-opacity": 0.7,

        // 🔥 AI COLORS
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0, "rgba(0,255,0,0)",
          0.3, "lime",
          0.5, "orange",
          0.8, "red"
        ]
      }
    });
  }catch(e){
    console.error("AI hotspot fetch failed",e);
  }

},[]);
async function drawHistoryRoute(history) {
   if (!history || !mapRef.current) return;

  setActivePanel(null);
  clearRoutes();

  const source = [history.sourceLng, history.sourceLat];
  const destination = [history.destLng, history.destLat];

  sourceRef.current = source;
  destinationRef.current = destination;

  // 🔴 Destination marker
  if (destinationMarkerRef.current) {
    destinationMarkerRef.current.remove();
  }

  destinationMarkerRef.current = new maplibregl.Marker({
    color: "red"
  })
    .setLngLat(destination)
    .addTo(mapRef.current);

  // 🟢 Draw route using SAVED geometry
 const data = await fetchRouteOptions(source, destination);

  if (!data?.routes?.length) {
    console.error("No routes found for history replay");
    return;
  }

  const route = data.routes[0];

  drawTrafficRoute(route.geometry, route.trafficLevel, 0);

  const bounds = route.geometry.coordinates.reduce(
    (b, coord) => b.extend(coord),
    new maplibregl.LngLatBounds(
      route.geometry.coordinates[0],
      route.geometry.coordinates[0]
    )
  );
    mapRef.current.fitBounds(bounds, {
    padding: 80,
    duration: 800
  });
  
}

// function highlightRoute(index) {
//   mapRef.current.setPaintProperty(
//     `route-layer-${index}`,
//     "line-width",
//     8
//   );
// }
 
 useEffect(() => {
  activePanelRef.current = activePanel;
}, [activePanel]);

useEffect(()=>{
  const interval = setInterval(()=> {
    drawAiHotspots();
  },10000);

  return ()=>clearInterval(interval);
},[drawAiHotspots]);
  useLayoutEffect(() => {
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [77.5946, 12.9716],
      zoom: 11
    });

    mapRef.current.addControl(new maplibregl.NavigationControl());

//    let source = null;
// let destination = null;

navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    const userCoords = [longitude, latitude];

    // ✅ Use ref instead of local variable
    sourceRef.current = userCoords;

    // Blue dot marker (current location)
    userMarkerRef.current = new maplibregl.Marker({
      color: "#1e90ff"
    })
      .setLngLat(userCoords)
      .addTo(mapRef.current);

    // Move camera to user
    mapRef.current.flyTo({
      center: userCoords,
      zoom: 13
    });

    console.log("Initial location:", latitude, longitude);
  },
  (error) => {
    console.error("Geolocation error:", error);
  },
  { enableHighAccuracy: true }
);
watchIdRef.current = navigator.geolocation.watchPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    const newCoords = [longitude, latitude];

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat(newCoords);
    }
    console.log("Tracking update:", latitude, longitude);

    // Smooth camera follow
    mapRef.current.easeTo({
      center: newCoords,
      duration: 1000
    });
  },
  (error) => {
    console.error("Tracking error:", error);
  },
  {
    enableHighAccuracy: true,
    maximumAge: 2000,
    timeout: 5000
    
  }
  
);
mapRef.current.on("click", async (e) => {

  const features = mapRef.current.queryRenderedFeatures(e.point);

  const clickedRoute = features.some(
    f => f.layer?.id?.startsWith("route-layer-")
  );

  // ⭐ collapse only if panel open AND not clicking route
  if (!clickedRoute && activePanelRef.current) {
    setActivePanel(null);
  }
});

// mapRef.current.on("click", async (e) => {
//   if (!source) {
//     alert("Waiting for current location…");
//     return;
//   }

//   if (destination) return; // prevent multiple clicks

//   destination = [e.lngLat.lng, e.lngLat.lat];

//   new maplibregl.Marker({ color: "red" })
//     .setLngLat(destination)
//     .addTo(mapRef.current);

//   await drawRoutesFrontBackend(source, destination);
// });

    return () =>{
      if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
      mapRef.current.remove();
    } 
  }, []);

  function trafficColor(level){
    if(level==="Red") return "#e74c3c";
    if(level==="Orange") return "#f39c12";
    return "#2ecc71";
  }
  function highlightRoute(index) {
  if (!mapRef.current || !routes) return;

  routes.forEach((_, i) => {
    const layerId = `route-layer-${i}`;

    if (!mapRef.current.getLayer(layerId)) return;

    mapRef.current.setPaintProperty(
      layerId,
      "line-width",
      i === index ? 8 : 4
    );

    mapRef.current.setPaintProperty(
      layerId,
      "line-opacity",
      i === index ? 1 : 0.4
    );

    mapRef.current.setPaintProperty(
      layerId,
      "line-blur",
      i === index ? 0 : 0.5
    );
  });
}

function drawTrafficRoute(geometry, trafficLevel, index) {
  const sourceId = `route-${index}`;
  const layerId = `route-layer-${index}`;

  if (mapRef.current.getLayer(layerId)) return;

  mapRef.current.addSource(sourceId, {
    type: "geojson",
    data: {
      type: "Feature",
      geometry
    }
  });

  mapRef.current.addLayer({
    id: layerId,
    type: "line",
    source: sourceId,
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-width": index === 0 ? 7 : 4,
      "line-color": trafficColor(trafficLevel),
      "line-opacity": index === 0 ? 0.95 : 0.6
    }
  });
}

  
// function saveBookmark(route){
//   console.log("Saving route to bookmark(later backend)",route);
// }
async function saveToHistory(route) {
  console.log("Saving route to history:", route);

  const payload = {
    sourceLat: sourceRef.current[1],
    sourceLng: sourceRef.current[0],
    destLat: destinationRef.current[1],
    destLng: destinationRef.current[0],
    distanceKm: route.distanceKm,
    durationMin: route.baseEtaMin,
    trafficEtaMin: route.trafficEtaMin,
    trafficLevel: route.trafficLevel
  };

  console.log("Payload:", payload);

  const res = await authFetch("/api/history", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  console.log("History save status:", res.status);
}

  return (
  <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
    {/* MAP */}
    <div
      ref={mapContainer}
      style={{
        position: "absolute",
        inset: 0
      }}
    />

    {/* SEARCH */}
    <LocationSearch
      onSelect={(coords) => {
        setAiAlert(null);
        if (!sourceRef.current) {
          alert("Waiting for current location");
          return;
        }

        destinationRef.current = coords;

        clearRoutes();
        setDestinationMarkerRef(coords);

        drawRoutesFrontBackend(
          sourceRef.current,
          destinationRef.current
        );
      }}
    />
    <button className="logout-clicker" onClick={logout}>Logout</button>
    {/* <RouteOptions
      routes={routes}
      onSelect={(route, index) => {
        selectedRouteRef.current = route;
        highlightRoute(index);
        saveToHistory(route);
      }}
      onSave={(route) => saveBookmark(route)}
    /> */}
    {aiAlert && (
       <div className="ai-alert-banner">
        {aiAlert}
        </div>
    )}
    <BottomBar
      activePanel={activePanel}
      setActivePanel={setActivePanel}
    />

    {/* BOTTOM SHEET */}
    <BottomSheet activePanel={activePanel}>
      {activePanel === "routes" && (
        <RouteOptions
          routes={routes}
          onSelect={(route, index) => {
            selectedRouteRef.current = route;
            highlightRoute(index);
            saveToHistory(route);
            setActivePanel(null); // collapse after selection
          }}
          onSave={(route) => saveBookmark(route)}
        />
      )}

      {activePanel === "history" && <HistoryPanel onSelect={drawHistoryRoute} onBookmark={saveBookmark}
      />}

      {activePanel === "bookmarks" && ( 
        <BookmarksPanel onSelect={drawHistoryRoute}/>
        )}
    </BottomSheet>
    

  </div>
  );
}
