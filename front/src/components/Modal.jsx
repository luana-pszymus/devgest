import "./Modal.css";

// Modal genérico.
// A tela que usa o modal decide qual conteúdo ficará dentro dele.
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

  // Fecha somente quando o usuário clica no fundo do modal.
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
      className="modal-fundo kitnet-modal-background"
      onMouseDown={fecharAoClicarFora}
    >
      <div className="modal kitnet-modal">
        <div className="modal-cabecalho kitnet-modal-header">
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
            className="close-modal-button"
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