import { BrowserRouter, Link, Route, Routes, useNavigate } from "react-router-dom";
import type { JSX } from "react";
import { api, sessionToken } from "./api";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function Guard({ children }: { children: JSX.Element }) {
  if (!sessionToken.get()) {
    return <Login />;
  }
  return children;
}

function Nav() {
  const navigate = useNavigate();
  const logout = async () => {
    try {
      await api.logout();
    } finally {
      sessionToken.clear();
      navigate("/login");
    }
  };
  return (
    <nav>
      <Link to="/">Jobs</Link> | <Link to="/admin">Admin</Link> |{" "}
      <button onClick={logout}>Log out</button>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Guard>
              <Dashboard />
            </Guard>
          }
        />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
