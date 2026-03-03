import { authFetch } from "./authFetch";

export async function loginUser(email,password) {
    const res = await fetch("http://localhost:8080/auth/login",{
      method:"POST",
      credentials:"include",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({email,password})
  });

  if(!res.ok) throw new Error("login failed");

  return true;
    
}
