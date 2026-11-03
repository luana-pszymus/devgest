import Botao from "../components/Botao";

// Cabeçalho principal do Dashboard.
function CabecalhoDashboard({
  mes,
  ano,
  onAtualizar,
  onSair,
}) {
  return (
    <header className="dashboard-header">
      <div>
        <span className="dashboard-eyebrow">
          GESTÃO DE KITNETS
        </span>

        <h1>Visão geral</h1>

        <p>
          {mes} de {ano}
        </p>
      </div>

      <div className="dashboard-header-actions">
        <Botao
          onClick={onAtualizar}
          title="Atualizar dados"
          aria-label="Atualizar dados"
        >
          ↻
        </Botao>

        <Botao
          tipo="cancelar"
          onClick={onSair}
        >
          Sair
        </Botao>
      </div>
    </header>
  );
}

export default CabecalhoDashboard;