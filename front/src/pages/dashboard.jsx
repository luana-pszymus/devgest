import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./dashboard.css";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Dashboard() {
  const [kitnets, setKitnets] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [inquilinos, setInquilinos] = useState([]);
  const [consumos, setConsumos] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [kitnetsResponse, contratosResponse, inquilinosResponse, consumosResponse] =
        await Promise.all([
          fetch("http://localhost:3000/api/kitnet"),
          fetch("http://localhost:3000/api/contratos"),
          fetch("http://localhost:3000/api/inquilinos"),
          fetch("http://localhost:3000/api/consumo/listar"),
        ]);

      if (
        !kitnetsResponse.ok ||
        !contratosResponse.ok ||
        !inquilinosResponse.ok ||
        !consumosResponse.ok
      ) {
        throw new Error("Não foi possível carregar os dados.");
      }

      const [kitnetsData, contratosData, inquilinosData, consumosData] =
        await Promise.all([
          kitnetsResponse.json(),
          contratosResponse.json(),
          inquilinosResponse.json(),
          consumosResponse.json(),
        ]);

      setKitnets(Array.isArray(kitnetsData) ? kitnetsData : []);
      setContratos(Array.isArray(contratosData) ? contratosData : []);
      setInquilinos(Array.isArray(inquilinosData) ? inquilinosData : []);
      setConsumos(Array.isArray(consumosData) ? consumosData : []);
    } catch (error) {
      console.error("Erro ao carregar Dashboard:", error);
      setErro("Não foi possível carregar os dados.");
    } finally {
      setCarregando(false);
    }
  }

  function encontrarContrato(kitnetId) {
    return contratos.find(
      (contrato) =>
        Number(contrato.kitnet_id) === Number(kitnetId) &&
        !contrato.data_fim,
    );
  }

  function encontrarInquilino(contrato) {
    if (!contrato) return null;

    return inquilinos.find(
      (inquilino) => Number(inquilino.id) === Number(contrato.inquilino_id),
    );
  }

  function encontrarUltimoConsumo(contratoId) {
    const registros = consumos
      .filter(
        (consumo) =>
          Number(consumo.contrato_id) === Number(contratoId),
      )
      .sort((a, b) => {
        const anoA = Number(a.ano);
        const anoB = Number(b.ano);
        const mesA = Number(a.mes);
        const mesB = Number(b.mes);

        if (anoA !== anoB) {
          return anoB - anoA;
        }

        return mesB - mesA;
      });

    return registros[0] || null;
  }

  const totalKitnets = kitnets.length;

  const kitnetsOcupadas = kitnets.filter((kitnet) =>
    encontrarContrato(kitnet.id),
  ).length;

  const kitnetsDisponiveis = totalKitnets - kitnetsOcupadas;

  const valorAlugueis = kitnets
    .filter((kitnet) => encontrarContrato(kitnet.id))
    .reduce(
      (total, kitnet) => total + Number(kitnet.valor_aluguel || 0),
      0,
    );

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  const consumosMesAtual = consumos.filter(
    (consumo) =>
      Number(consumo.mes) === mesAtual &&
      Number(consumo.ano) === anoAtual,
  );

  const valorEnergiaMes = consumosMesAtual.reduce(
    (total, consumo) => total + Number(consumo.valor_energia || 0),
    0,
  );

  return (
    <div className="dashboard">
      <main className="dashboard-content">
        {/* CABEÇALHO */}
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">GESTÃO DE KITNETS</span>

            <h1>Visão geral</h1>

            <p>
              {MESES[mesAtual - 1]} de {anoAtual}
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={carregarDados}
            title="Atualizar dados"
            aria-label="Atualizar dados"
          >
            ↻
          </button>
        </header>

        {/* ERRO */}
        {erro && (
          <div className="dashboard-error">
            <strong>Não foi possível carregar os dados.</strong>

            <button onClick={carregarDados}>Tentar novamente</button>
          </div>
        )}

        {/* CARREGANDO */}
        {carregando ? (
          <div className="dashboard-loading">
            <div className="loading-circle"></div>
            <p>Carregando seus dados...</p>
          </div>
        ) : (
          <>
            {/* RESUMO */}
            <section className="summary-section">
              <div className="summary-card summary-main">
                <span className="summary-label">Aluguéis cadastrados</span>

                <strong className="summary-value">
                  {formatarMoeda(valorAlugueis)}
                </strong>

                <span className="summary-description">
                  {kitnetsOcupadas}{" "}
                  {kitnetsOcupadas === 1 ? "kitnet ocupada" : "kitnets ocupadas"}
                </span>
              </div>

              <div className="summary-grid">
                <div className="summary-card">
                  <div className="summary-icon blue">⌂</div>

                  <strong>{totalKitnets}</strong>

                  <span>Total de kitnets</span>
                </div>

                <div className="summary-card">
                  <div className="summary-icon yellow">✓</div>

                  <strong>{kitnetsOcupadas}</strong>

                  <span>Ocupadas</span>
                </div>

                <div className="summary-card">
                  <div className="summary-icon green">+</div>

                  <strong>{kitnetsDisponiveis}</strong>

                  <span>Disponíveis</span>
                </div>

                <div className="summary-card">
                  <div className="summary-icon blue">⚡</div>

                  <strong>{formatarMoeda(valorEnergiaMes)}</strong>

                  <span>Energia no mês</span>
                </div>
              </div>
            </section>

            {/* KITNETS */}
            <section className="kitnets-section">
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">SEUS IMÓVEIS</span>
                  <h2>Kitnets</h2>
                </div>

                <span className="kitnet-count">
                  {totalKitnets}
                </span>
              </div>

              {kitnets.length === 0 ? (
                <div className="empty-dashboard">
                  <div className="empty-icon">⌂</div>

                  <h3>Nenhuma kitnet cadastrada</h3>

                  <p>
                    Quando houver imóveis cadastrados, eles aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="kitnet-list">
                  {kitnets.map((kitnet) => {
                    const contrato = encontrarContrato(kitnet.id);
                    const inquilino = encontrarInquilino(contrato);
                    const ultimoConsumo = encontrarUltimoConsumo(
                      contrato?.id,
                    );

                    const ocupada = Boolean(contrato);

                    return (
                      <article
                        className="kitnet-card"
                        key={kitnet.id}
                      >
                        <div className="kitnet-card-header">
                          <div>
                            <span className="kitnet-number">
                              KITNET
                            </span>

                            <h3>
                              {kitnet.numero ||
                                `Kitnet ${String(kitnet.id).padStart(2, "0")}`}
                            </h3>
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
                            <span>Inquilino</span>

                            <strong>
                              {inquilino?.nome || "Nenhum inquilino"}
                            </strong>
                          </div>

                          <div className="info-row">
                            <span>Aluguel</span>

                            <strong>
                              {formatarMoeda(kitnet.valor_aluguel)}
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
                              Esta kitnet está disponível para um novo
                              inquilino.
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Navbar />
    </div>
  );
}