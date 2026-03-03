import { useEffect, useState } from "react";
import  { fetchRouteHistory } from "../api/historyApi";

export default function HistoryPanel({onSelect,onBookmark}){
    const[history,setHistory] = useState([]);
    useEffect(() => {
    fetchRouteHistory().then(setHistory).catch(console.error);
  }, []);

  return (
    <div>
      <h3>Route History</h3>

      {history.length === 0 && <p>No routes yet</p>}

      {history.map((h) => (
        <div key={h.id} 
        className="history-card"
        onClick={() => onSelect(h)}
        >
          <p>
            {h.distanceKm.toFixed(1)} km •{" "}
            {h.trafficEtaMin.toFixed(1)} min
          </p>
          <p>Traffic: {h.trafficLevel}</p>
          <small>{new Date(h.createdAt).toLocaleString()}</small>
          <div>
            <button onClick={(e)=>{
              e.stopPropagation();
              onBookmark(h);
            }}>BookMark
          </button>
          </div>  
           
        </div>
      ))}
     
    </div>
  );
}