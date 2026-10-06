import "./Modal.css";

function Modal({
  aberto,
  titulo,
  eyebrow,
  descricao,
  children,
  onFechar,
  bloqueado = false,
}) {
  if (!aberto) {
    return null;
  }

  function fecharAoClicarFora(event) {
    if (
      event.target === event.currentTarget &&
      !bloqueado
    ) {
      onFechar();
    }
  }

  return (
    <div
      className="modal-fundo"
      onMouseDown={fecharAoClicarFora}
    >
      <div className="modal">
        <div className="modal-cabecalho">
          <div>
            {eyebrow && (
              <span className="modal-eyebrow">
                {eyebrow}
              </span>
            )}

            <h2>{titulo}</h2>

            {descricao && <p>{descricao}</p>}
          </div>

          <button
            type="button"
            onClick={onFechar}
            disabled={bloqueado}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Modal;