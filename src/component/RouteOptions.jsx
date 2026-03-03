
export default function RouteOptions({routes,onSelect,onSave}) {

    if(!routes|| routes.length === 0){
        return null;
    }

    return(
        <div className="route-panel"
        //     style={{
        //     position: "absolute",
        //     bottom: 20,
        //     left: 20,
        //     zIndex: 10,
        //     background: "white",
        //     padding: "12px",
        //     borderRadius: "8px",
        //     width: "320px",
        //     maxHeight: "40vh",
        //     overflowY: "auto"
        //  }}
        >
          <h3 className="panel-title">Route Options</h3>
            {routes.map((route,index)=>(
                <div key={route.routeId} className="route-card">
                    <div>
                        <strong>Route { index + 1}</strong>
                        <div>{route.trafficEtaMin.toFixed(1)}min * {route.distanceKm.toFixed(1)}km </div>
                        <div>Traffic : {route.trafficLevel}</div>

                    </div>

                    <div className="rotue-actions">
                        <button onClick={() => onSelect(route,index)}>Select</button>
                        <button onClick={()=>onSelect(route)}>UnSelect</button>
                        <button onClick={() => onSave(route)}>Bookmark</button>
                    </div>

                 </div>       

             ))}

        </div>
    );
}