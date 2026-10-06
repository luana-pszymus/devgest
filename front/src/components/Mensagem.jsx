import "./Mensagem.css";

function Mensagem({ children }) {
  return <p className="mensagem">{children}</p>;
}

export default Mensagem;