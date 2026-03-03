import {BrowserRouter,Routes,Route} from "react-router-dom";
import Login from "./pages/Login";
import MapView from "./component/MapView";
import ProtectedRoute from "./auth/ProtectedRoute";
import Register from "./pages/Register";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path ="/" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        <Route
           path="/map"
           element={
            <ProtectedRoute>
              <MapView/>
            </ProtectedRoute>
           }
        />
      </Routes>
    </BrowserRouter>
  );
    
}

export default App;
