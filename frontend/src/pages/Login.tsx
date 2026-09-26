import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, sessionToken } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r =
        mode === "login"
          ? await api.login(email, password)
          : await api.register(email, password);
      sessionToken.set(r.token);
      navigate("/");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "request failed");
    }
  };

  return (
    <div>
      <h1>{mode === "login" ? "Log in" : "Register"}</h1>
      <form onSubmit={submit}>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password (8+ chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button>{mode === "login" ? "Log in" : "Register"}</button>
      </form>
      {msg && <p>{msg}</p>}
      <button
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "Need an account? Register" : "Have an account? Log in"}
      </button>
    </div>
  );
}
