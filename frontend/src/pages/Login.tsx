import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, sessionToken } from "../api";

const input =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none";
const btn =
  "w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700";

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
    <div className="mx-auto mt-16 max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-bold">
        {mode === "login" ? "Log in" : "Register"}
      </h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          className={input}
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={input}
          type="password"
          placeholder="password (8+ chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className={btn}>{mode === "login" ? "Log in" : "Register"}</button>
      </form>
      {msg && <p className="mt-3 text-sm text-red-700">{msg}</p>}
      <button
        className="mt-4 w-full text-center text-sm text-indigo-700 hover:underline"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "Need an account? Register" : "Have an account? Log in"}
      </button>
    </div>
  );
}
