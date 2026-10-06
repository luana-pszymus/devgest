import Card from "../components/Card";

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Mostra os principais números do Dashboard.
function ResumoDashboard({
  valorAlugueis,
  totalKitnets,
  kitnetsOcupadas,
  kitnetsDisponiveis,
  valorEnergiaMes,
}) {
  return (
    <section className="summary-section">
      {/* Card principal com o valor dos aluguéis */}
      <Card className="summary-card summary-main">
        <div>
          <span className="summary-label">
            Aluguéis cadastrados
          </span>

          <strong className="summary-value">
            {formatarMoeda(valorAlugueis)}
          </strong>

          <span className="summary-description">
            {kitnetsOcupadas}{" "}
            {kitnetsOcupadas === 1
              ? "kitnet ocupada"
              : "kitnets ocupadas"}
          </span>
        </div>
      </Card>

      {/* Cards menores com os outros indicadores */}
      <div className="summary-grid">
        <Card className="summary-card">
          <div className="summary-icon blue">
            ⌂
          </div>

          <strong>{totalKitnets}</strong>

          <span>Total de kitnets</span>
        </Card>

        <Card className="summary-card">
          <div className="summary-icon yellow">
            ✓
          </div>

          <strong>{kitnetsOcupadas}</strong>

          <span>Ocupadas</span>
        </Card>

        <Card className="summary-card">
          <div className="summary-icon green">
            +
          </div>

          <strong>{kitnetsDisponiveis}</strong>

          <span>Disponíveis</span>
        </Card>

        <Card className="summary-card energy-summary">
          <div className="summary-icon yellow">
            ⚡
          </div>

          <strong>
            {formatarMoeda(valorEnergiaMes)}
          </strong>

          <span>Energia no mês</span>
        </Card>
      </div>
    </section>
  );
}

export default ResumoDashboard;