import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get("redirect") || "/";
  const action = new URLSearchParams(location.search).get("action"); // run or save

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/register";

      const { data } = await axios.post(endpoint, { name, email, password });
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);

      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      navigate(`${redirectPath}?action=${action || ""}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-white">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-96">
        <h1 className="text-2xl font-bold text-center mb-6">{isLogin ? "Welcome Back" : "Create Account"}</h1>
        {error && <p className="text-red-400 text-center mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600" required />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600" />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition-all">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:underline ml-1">{isLogin ? "Sign Up" : "Login"}</button>
        </p>
      </div>
    </div>
  );
}
