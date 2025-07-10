// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { LoginAndSignUp as Login } from "../../constants/navigation.jsx";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to={Login} replace />;
  }

  return children;
};

export default ProtectedRoute;
