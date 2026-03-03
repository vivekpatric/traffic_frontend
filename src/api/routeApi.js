import { authFetch } from "./authFetch";


export async function fetchRouteOptions(source,destination) {

  const body = {
    sourceLat: source[1],
    sourceLng: source[0],
    destLat: destination[1],
    destLng: destination[0]
  };

  const res = await authFetch("/api/routes/options", {
    method:"POST",
    body: JSON.stringify(body)
  });

  if(!res.ok) throw new Error("Backend error");

  return res.json();
}
