import { useState } from "react";
import { searchLocation } from "../api/SearchApi";
import "../styles/LocationSearch.css";

export default function LocationSearch({onSelect}){
    const[query,setQuery] = useState("");
    const[results,setResults]=useState([]);
    const[typingTimeout,setTyingTimeout]=useState(null);
    async function handleChange(e) {
        const val = e.target.value;
        setQuery(val);
        if(typingTimeout){
            clearTimeout(typingTimeout);
        }
        if (val.length < 3){
            setResults([]);
            return;
        }
        const timeout = setTimeout(async()=>{
            try{
                const data = await searchLocation(val);
                setResults(data);

            }catch(err){
                console.error("Search Failed ",err);
            }
        },400);
        
        setTyingTimeout(timeout);

    }
    return(
        <div className="search-box" >
            <input
               placeholder="Search destination"
               value={query}
               onChange={handleChange}
            />
            {results.length>0 && (
                <ul>
                {results.map((place) => (
                    <li
                      key={place.place_id}
                      onClick={()=> {
                        onSelect([
                            parseFloat(place.lon),
                            parseFloat(place.lat)
                        ]);
                        setResults([]);
                        setQuery(place.display_name);

                      }}
                      >
                    {place.display_name}
                    </li>
                ))}
            </ul>
            )}
            
        </div>
    );
}