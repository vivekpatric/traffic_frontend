// export async function searchLocation(query) {
//     if(!query || query.length>3){
//       return [];
//     }
//     const res = await fetch(
//         `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
//     );
//     return res.json();
    
// }
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
export async function searchLocation(query) {
    const params = new URLSearchParams({
        q: query,
    format: "json",
    addressdetails: 1,
    limit: 5,

    // 🔥 INDIA + BANGALORE BIAS
    countrycodes: "in",
    viewbox: "77.3,13.2,77.9,12.7", // Bangalore bounding box
    bounded: 1
    });

    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`,{
        headers: {
            "Accept":"application/json"
        }
    });
    return res.json();
    
}

