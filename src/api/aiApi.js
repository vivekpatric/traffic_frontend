import { authFetch } from "./authFetch";

export async function fetchHotspots() {
    const res = await authFetch("/api/ai/hotspots");
    return res.json();
}
export async function fetchPrediction(destLat,destLng) {
    const res = await authFetch(
        `/api/ai/predict?destLat=${destLat}&destLng=${destLng}`
    );
    return res.json();
}