import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

export default function Register(){
    const[email,setEmail] = useState("");
    const[password,setPassword] = useState("");
    const navigate = useNavigate();
    async function handleRegister() {
        await fetch("https://traffic-backend-6.onrender.com/auth/register",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({email,password})
        });
        alert("Registration Successfull");
        navigate("/login");

    }
    return(
        <AuthLayout>
            <div className="login-container">
                <h2>Register</h2>
                <input placeholder="Enter your Email" onChange={e=>setEmail(e.target.value)} />
                <input placeholder="Enter your Password" onChange={e=>setPassword(e.target.value)} />
                <button onClick={handleRegister}>Register</button>
                <p style={{fontSize:'10px',marginTop:'10px'}}>Already Registered?<a href="/login" style={{color: 'var(--lofi-blue)'}}>Login</a></p>
            </div>
        </AuthLayout>
    );
}