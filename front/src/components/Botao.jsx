


import "./Botao.css";

function Botao({
  children,
  onClick,
  tipo = "principal",
  type = "button",
  disabled = false,
  className = "",
}) {
  return (
    <button
      type={type}
      className={`botao ${tipo} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Botao;