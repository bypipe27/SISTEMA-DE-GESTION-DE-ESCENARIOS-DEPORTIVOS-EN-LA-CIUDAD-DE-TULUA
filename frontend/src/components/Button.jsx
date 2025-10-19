import React from "react";

function Button({ children, color = "green", onClick }) {
  const base = "px-6 py-3 rounded-xl shadow-md transition text-lg font-medium";

  const colors = {
    green: "bg-green-500 hover:bg-green-400 text-white",
    white: "bg-white hover:bg-gray-200 text-green-700",
    outline: "border border-white text-white hover:bg-white hover:text-green-700",
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
