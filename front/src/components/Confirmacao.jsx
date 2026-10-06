import "./Confirmacao.css";

function Confirmacao({ mensagem, onConfirmar, onCancelar }) {
  return (
    <div className="confirmacao-fundo">
      <div className="confirmacao">
        <p>{mensagem}</p>

        <div className="confirmacao-botoes">
          <button className="cancelar" onClick={onCancelar}>
            Cancelar
          </button>

          <button className="perigo" onClick={onConfirmar}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Confirmacao;