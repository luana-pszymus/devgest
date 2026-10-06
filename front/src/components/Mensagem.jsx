import "./Mensagem.css";

// Mensagem simples usada para avisos, erros e informações.
function Mensagem({ children, className = "" }) {
  return (
    <p className={`mensagem ${className}`}>
      {children}
    </p>
  );
}

export default Mensagem;