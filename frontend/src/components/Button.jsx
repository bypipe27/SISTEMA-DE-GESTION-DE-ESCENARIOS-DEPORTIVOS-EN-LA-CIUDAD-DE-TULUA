import React from "react";

function Button({ children, color = "green", onClick }) {
  const base = "px-6 py-3 rounded-xl shadow-md transition text-lg font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const colors = {
    // Usamos un verde más oscuro para asegurar suficiente contraste con texto blanco
    green: "bg-green-700 hover:bg-green-800 text-white focus-visible:ring-green-300",
    white: "bg-white hover:bg-gray-200 text-green-700 focus-visible:ring-green-300",
    outline: "border border-white text-white hover:bg-white hover:text-green-700 focus-visible:ring-green-300",
  };

  return (
    <button
      className={`${base} ${colors[color]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
