"use client";
import { useState } from "react";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    alert(`Registered: ${email} as ${role}`);
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 border"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 border"
        required
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full px-3 py-2 border"
        required
      >
        <option value="">Select Role</option>
        <option value="DH">DH</option>
        <option value="PE">PE</option>
        <option value="FM">FM</option>
        <option value="OM">OM</option>
        <option value="CEO">CEO</option>
        <option value="HR">HR</option>
      </select>
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 hover:bg-green-700"
      >
        Register
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
}
