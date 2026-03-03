
export async function loginUser(email,password) {
    const res = await fetch("https://traffic-backend-6.onrender.com/auth/login",{
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
