import LoginAndSignUp from "./screens/LoginSignUp/LoginAndSignUp";
import MemoryGame from "./screens/MemoryGame/MemoryGame";
import NotFound from "./screens/NotFound/NotFound";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  LoginAndSignUp as Login,
  MemoryGame as MGame,
} from "./constants/navigation";
import ProtectedRoute from "./screens/ProtectedRoute/ProtectedRoute";
import Loader from "./components/loader/Loader";
import { useLoader } from "./context/LoaderContext";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { loading } = useLoader();
  return (
    <BrowserRouter>
      <ToastContainer />
      {loading && <Loader />}
      <Routes>
        <Route path="/" element={<LoginAndSignUp />} />
        <Route path={Login} element={<LoginAndSignUp />} />
        {/* Protected game route */}
        <Route
          path={MGame}
          element={
            <ProtectedRoute>
              <MemoryGame />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
