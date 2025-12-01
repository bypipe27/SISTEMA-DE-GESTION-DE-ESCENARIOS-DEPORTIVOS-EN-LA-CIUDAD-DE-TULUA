import React from "react";

function Button({ children, color = "green", onClick, disabled = false, className = "", type = "button", ...rest }) {
  const base = "px-6 py-3 rounded-xl shadow-md transition text-lg font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

  const colors = {
    // Usamos un verde más oscuro para asegurar suficiente contraste con texto blanco
    green: "bg-green-700 hover:bg-green-800 text-white focus-visible:ring-green-300 disabled:bg-green-600",
    white: "bg-white hover:bg-gray-200 text-green-700 focus-visible:ring-green-300 disabled:bg-gray-100",
    outline: "border border-white text-white hover:bg-white hover:text-green-700 focus-visible:ring-green-300 disabled:border-gray-300 disabled:text-gray-400",
  };

  return (
    <button
      className={`${base} ${colors[color]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
