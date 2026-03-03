import { createContext,useContext,useEffect,useState } from "react";
import { authFetch } from "../api/authFetch";

const AuthContext = createContext();

export default function AuthProvider({children}){
     const [isAuthenticated, setIsAuthenticated] = useState(false);
     const [loading,setLoading] = useState(true);
     useEffect(()=>{
        authFetch("/auth/me")
        .then(res =>{
            if(res.ok)setIsAuthenticated(true);
        })
        .catch(()=>{})
        .finally(()=>setLoading(false));
     },[]);

    const login =() => setIsAuthenticated(true);

    const logout = async() =>{
           await authFetch("/auth/logout", {
        method: "POST",
        
        });
        setIsAuthenticated(false);
    }

    return(
        <AuthContext.Provider value ={{isAuthenticated,login,logout,loading}}>
            {children}
        </AuthContext.Provider>

        );

}
export const useAuth= ()=>useContext(AuthContext);