import Card from "../components/Card";

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Mostra todas as informações de uma única kitnet.
function KitnetCard({
  kitnet,
  contrato,
  inquilino,
  ultimoConsumo,
}) {
  const ocupada = Boolean(contrato);

  return (
    <Card className="kitnet-card">
      <div className="kitnet-card-header">
        <div className="kitnet-title-area">
          <div className="kitnet-icon">⌂</div>

          <div>
            <span className="kitnet-number">
              KITNET
            </span>

            <h3>
              {kitnet.numero ||
                `Kitnet ${String(kitnet.id).padStart(
                  2,
                  "0",
                )}`}
            </h3>
          </div>
        </div>

        <span
          className={
            ocupada
              ? "occupancy occupied"
              : "occupancy available"
          }
        >
          <span className="occupancy-dot"></span>

          {ocupada ? "Ocupada" : "Disponível"}
        </span>
      </div>

      <div className="kitnet-divider"></div>

      <div className="kitnet-info">
        <div className="info-row">
          <span>Aluguel</span>

          <strong>
            {formatarMoeda(kitnet.valor_aluguel)}
          </strong>
        </div>

        <div className="info-row">
          <span>Inquilino</span>

          <strong>
            {inquilino?.nome || "Nenhum inquilino"}
          </strong>
        </div>

        {ultimoConsumo && (
          <div className="energy-info">
            <div className="energy-title">
              <span>⚡</span>
              <strong>Último consumo</strong>
            </div>

            <div className="energy-values">
              <div>
                <span>Consumo</span>

                <strong>
                  {Number(
                    ultimoConsumo.consumo_kwh || 0,
                  ).toFixed(0)}{" "}
                  kWh
                </strong>
              </div>

              <div>
                <span>Energia</span>

                <strong>
                  {formatarMoeda(
                    ultimoConsumo.valor_energia,
                  )}
                </strong>
              </div>
            </div>
          </div>
        )}

        {!ocupada && (
          <div className="available-message">
            Esta kitnet está disponível para um
            novo inquilino.
          </div>
        )}
      </div>
    </Card>
  );
}

export default KitnetCard;