import Botao from "../components/Botao";
import Campo from "../components/Campo";
import Mensagem from "../components/Mensagem";
import Modal from "../components/Modal";

function FormularioKitnet({
  aberto,
  onFechar,
  onSubmit,
  numero,
  setNumero,
  valor,
  setValor,
  erro,
  mensagem,
  salvando,
}) {
  return (
    <Modal
      aberto={aberto}
      titulo="Adicionar kitnet"
      eyebrow="NOVO IMÓVEL"
      descricao="Informe os dados básicos da kitnet."
      onFechar={onFechar}
      bloqueado={salvando}
    >
      <form className="kitnet-form" onSubmit={onSubmit}>
        <Campo
          id="numero-kitnet"
          label="Número da kitnet"
          value={numero}
          onChange={(event) => setNumero(event.target.value)}
          placeholder="Ex.: 01"
          disabled={salvando}
          autoFocus
        />

        <div className="form-field">
          <label htmlFor="valor-aluguel">
            Valor do aluguel
          </label>

          <div className="money-input">
            <span>R$</span>

            <input
              id="valor-aluguel"
              type="number"
              min="0.01"
              step="0.01"
              value={valor}
              onChange={(event) => setValor(event.target.value)}
              placeholder="500,00"
              disabled={salvando}
            />
          </div>
        </div>

        {erro && (
          <Mensagem className="kitnet-form-message error">
            {erro}
          </Mensagem>
        )}

        {mensagem && (
          <Mensagem className="kitnet-form-message success">
            {mensagem}
          </Mensagem>
        )}

        <div className="kitnet-form-actions">
          <Botao
            tipo="cancelar"
            onClick={onFechar}
            disabled={salvando}
          >
            Cancelar
          </Botao>

          <Botao type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Cadastrar kitnet"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}

export default FormularioKitnet;