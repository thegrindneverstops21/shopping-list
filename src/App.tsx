import { Navigate, Route } from "react-router-dom";
import RegisterPage from "./features/RegisterPage";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import LoginPage from "./features/LoginPage";
import "./styles/auth.css";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <Route>
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
    <Route
        path="/"
        element={<ProtectedRoute>
          <Layout><HomePage /></Layout>
        </ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute>
          <Layout><ProfilePage /></Layout>
        </ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  )
}