import React from "react";
import { useState, useEffect } from "react";

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/usuarios")
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error("❌ Error al conectar con el backend:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email }),
    });

    const data = await res.json();
    setUsuarios([...usuarios, data]);
    setNombre("");
    setEmail("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Usuarios ⚽</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Agregar Usuario</button>
      </form>

      <h2>Usuarios registrados:</h2>
      <ul>
        {usuarios.map((u) => (
          <li key={u.id}>
            {u.nombre} — {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
