import { useEffect, useState } from "react";
import { fetchBookmarks } from "../api/bookmarkApi";

export default function BookmarksPanel({onSelect}){
    const [bookmarks,setBookmarks] = useState([]);
    useEffect(()=>{
        fetchBookmarks().then(setBookmarks);
    },[]);

    return(
        <div>
            <h3>BookMarkRoutes</h3>
              {bookmarks.length===0 && <p>No BookMarks</p>}
              {bookmarks.map(b => (
                <div 
                  key={b.id}
                  className="bookmark-card"
                  onClick={() => onSelect(b)}
                >
                    <p>{b.distanceKm.toFixed(1)}Km</p>
                    <p>Traffic:{b.trafficLevel}</p>
                </div>  
              ))}
        </div>
    );
}