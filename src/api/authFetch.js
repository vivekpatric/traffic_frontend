
const BASE = "https://traffic-backend-6.onrender.com";

export async function authFetch(path, options = {}) {
  console.log("authfetch path : ",path);
  const res = await fetch(BASE + path, {
    
    
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });


 const isAuthEndpoint = path.startsWith("/auth/login") || path.startsWith("/auth/");
  if(!isAuthEndpoint && (res.status===401 || res.status===403)){
    window.location.href="/login";
    throw new Error("Unauthorized");
  }
  return res;
}