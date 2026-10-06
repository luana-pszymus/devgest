import "./Modal.css";

function Modal({ aberto, titulo, children, onFechar }) {
  if (!aberto) {
    return null;
  }

  return (
    <div className="modal-fundo">
      <div className="modal">
        <div className="modal-cabecalho">
          <h2>{titulo}</h2>

          <button onClick={onFechar}>×</button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Modal;