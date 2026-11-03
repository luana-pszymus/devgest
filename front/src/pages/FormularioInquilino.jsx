
function FormularioInquilino({
  editando,
  nome,
  setNome,
  telefone,
  setTelefone,
  email,
  setEmail,
  kitnetId,
  setKitnetId,
  kitnetsDisponiveis,
  salvando,
  onSalvar,
  onFechar,
}) {
  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <section className="tenant-form card">
      <div className="form-top">
        <div>
          <span className="form-label-small">
            {editando ? "EDITAR" : "NOVO CADASTRO"}
          </span>

          <h2>{editando ? "Editar inquilino" : "Novo inquilino"}</h2>
        </div>

        <button
          type="button"
          className="close-button"
          onClick={onFechar}
        >
          ×
        </button>
      </div>

      <form onSubmit={onSalvar}>
        <div className="form-group">
          <label className="form-label">Nome</label>

          <input
            className="form-input"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome completo"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Telefone</label>

          <input
            className="form-input"
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(42) 99999-9999"
          />
        </div>

        <div className="form-group">
          <label className="form-label">E-mail</label>

          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Kitnet</label>

          <select
            className="form-input"
            value={kitnetId}
            onChange={(e) => setKitnetId(e.target.value)}
            required
          >
            <option value="">Selecione uma kitnet</option>

            {kitnetsDisponiveis.map((kitnet) => (
              <option key={kitnet.id} value={kitnet.id}>
                Kitnet {kitnet.numero}
                {" — "}
                {formatarMoeda(kitnet.valor_aluguel)}
              </option>
            ))}
          </select>

          {kitnetsDisponiveis.length === 0 && (
            <span
              style={{
                display: "block",
                marginTop: "6px",
                fontSize: "11px",
                color: "#856c3e",
              }}
            >
              Não há kitnets disponíveis.
            </span>
          )}
        </div>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={salvando || kitnetsDisponiveis.length === 0}
        >
          {salvando
            ? "Salvando..."
            : editando
              ? "Salvar alterações"
              : "Cadastrar inquilino"}
        </button>
      </form>
    </section>
  );
}

export default FormularioInquilino;
