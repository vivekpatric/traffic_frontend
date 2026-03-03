import { useState } from "react";
import { loginUser } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";
import {useNavigate} from "react-router-dom";
import AuthLayout from "./AuthLayout";

export default function Login(){
    const {login} = useAuth();
    const navigate = useNavigate();
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");

    async function handleLogin() {
        try{
             await loginUser(email,password);
            //console.log("LOGIN RESPONSE:",data)
            login(true);
            navigate("/map");

        }
        catch(e){
            alert("login failed");
        }
    }
    return(
        <AuthLayout>
            <div className="login-container">
                <h2>Login</h2>
                <input
                placeholder="Enter Your Email"
                onChange={(e)=>setEmail(e.target.value)}
                />
                <input
                placeholder="Enter Your Password"
                onChange={(e)=>setPassword(e.target.value)}
                />

                <button onClick={handleLogin}>Login</button>
                <p style={{fontSize:'10px',marginTop:'10px'}}>New here?<a href="/" style={{color: 'var(--lofi-blue)'}}>Register</a></p>
            </div>
        </AuthLayout>
    );
}