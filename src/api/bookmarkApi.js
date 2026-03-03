import { authFetch } from "./authFetch";


// export async function saveBookmark(route) {
//     await fetch(`${BASE_URL}/bookmarks`, {
//       method:"POST",
//       headers:{"Content-Type" : "application/json"},
//       body: JSON.stringify({
//         sourceLat: route.sourceLat,
//         sourceLng: route.sourceLng,
//         destLat: route.destLat,
//         destLng: route.destLng,
//         distanceKm: route.distanceKm,
//         trafficEtaMin: route.trafficEtaMin,
//         trafficLevel: route.trafficLevel
//     })
//     })
// }
export async function saveBookmark(route){
  await authFetch("/api/bookmarks",{
    method:"POST",
    body: JSON.stringify(route)
  });
}
export async function fetchBookmarks(){
  const res = await authFetch("/api/bookmarks");
  return res.json();
}
// export async function fetchBookmarks() {
//   const res = await fetch(`${BASE_URL}/bookmarks`);
//   return res.json();
// }
