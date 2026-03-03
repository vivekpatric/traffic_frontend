import { authFetch } from "./authFetch";

export async function fetchRouteHistory() {
  const res = await authFetch("/api/history");
  if(!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}