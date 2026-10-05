import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";

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

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [salvandoKitnet, setSalvandoKitnet] = useState(false);

  const [numeroKitnet, setNumeroKitnet] = useState("");
  const [valorAluguel, setValorAluguel] = useState("");

  const [mensagemKitnet, setMensagemKitnet] = useState("");
  const [erroKitnet, setErroKitnet] = useState("");

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");

    navigate("/login");
  };

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [
        kitnetsResponse,
        contratosResponse,
        inquilinosResponse,
        consumosResponse,
      ] = await Promise.all([
        api.get("/api/kitnet/listar"),
        api.get("/api/contratos"),
        api.get("/api/inquilino/listar"),
        api.get("/api/consumo/listar"),
      ]);

      const kitnetsData = kitnetsResponse.data;
      const contratosData = contratosResponse.data;
      const inquilinosData = inquilinosResponse.data;
      const consumosData = consumosResponse.data;

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
        Number(contrato.kitnet_id) === Number(kitnetId) && !contrato.data_fim,
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
      .filter((consumo) => Number(consumo.contrato_id) === Number(contratoId))
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

  function abrirFormularioKitnet() {
    setNumeroKitnet("");
    setValorAluguel("");
    setMensagemKitnet("");
    setErroKitnet("");
    setMostrarFormulario(true);
  }

  function fecharFormularioKitnet() {
    if (salvandoKitnet) return;

    setMostrarFormulario(false);
    setNumeroKitnet("");
    setValorAluguel("");
    setMensagemKitnet("");
    setErroKitnet("");
  }

  async function cadastrarKitnet(event) {
    event.preventDefault();

    setErroKitnet("");
    setMensagemKitnet("");

    const numero = numeroKitnet.trim();
    const valor = Number(valorAluguel);

    if (!numero) {
      setErroKitnet("Informe o número da kitnet.");
      return;
    }

    if (!valor || valor <= 0) {
      setErroKitnet("Informe um valor de aluguel válido.");
      return;
    }

    const numeroJaExiste = kitnets.some(
      (kitnet) =>
        String(kitnet.numero).trim().toLowerCase() === numero.toLowerCase(),
    );

    if (numeroJaExiste) {
      setErroKitnet("Já existe uma kitnet com esse número.");
      return;
    }

    try {
      setSalvandoKitnet(true);

      const response = await api.post("/api/kitnet", {
        numero,
        valor_aluguel: valor,
      });

      console.log(response.data);

      setMensagemKitnet("Kitnet cadastrada com sucesso.");

      setNumeroKitnet("");
      setValorAluguel("");

      await carregarDados();

      setTimeout(() => {
        setMostrarFormulario(false);
        setMensagemKitnet("");
      }, 700);
    } catch (error) {
      console.error("Erro ao cadastrar kitnet:", error);

      setErroKitnet(
        error.response?.data?.erro ||
          error.response?.data?.message ||
          error.message ||
          "Não foi possível cadastrar a kitnet.",
      );
    } finally {
      setSalvandoKitnet(false);
    }
  }

  const totalKitnets = kitnets.length;

  const kitnetsOcupadas = kitnets.filter((kitnet) =>
    encontrarContrato(kitnet.id),
  ).length;

  const kitnetsDisponiveis = totalKitnets - kitnetsOcupadas;

  const valorAlugueis = kitnets
    .filter((kitnet) => encontrarContrato(kitnet.id))
    .reduce((total, kitnet) => total + Number(kitnet.valor_aluguel || 0), 0);

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  const consumosMesAtual = consumos.filter(
    (consumo) =>
      Number(consumo.mes) === mesAtual && Number(consumo.ano) === anoAtual,
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

          <div className="dashboard-header-actions">
            <button
              className="refresh-button"
              onClick={carregarDados}
              title="Atualizar dados"
              aria-label="Atualizar dados"
            >
              ↻
            </button>

            <button
              className="logout-button"
              onClick={handleLogout}
              title="Sair do sistema"
            >
              Sair
            </button>
          </div>
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
                <div>
                  <span className="summary-label">Aluguéis cadastrados</span>

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

                <div className="summary-card energy-summary">
                  <div className="summary-icon yellow">⚡</div>

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

                <button
                  className="add-kitnet-button"
                  onClick={abrirFormularioKitnet}
                >
                  <span>+</span>
                  Adicionar kitnet
                </button>
              </div>

              {kitnets.length === 0 ? (
                <div className="empty-dashboard">
                  <div className="empty-icon">⌂</div>

                  <h3>Nenhuma kitnet cadastrada</h3>

                  <p>Cadastre sua primeira kitnet para começar.</p>

                  <button
                    className="empty-add-button"
                    onClick={abrirFormularioKitnet}
                  >
                    + Adicionar kitnet
                  </button>
                </div>
              ) : (
                <div className="kitnet-list">
                  {kitnets.map((kitnet) => {
                    const contrato = encontrarContrato(kitnet.id);
                    const inquilino = encontrarInquilino(contrato);
                    const ultimoConsumo = encontrarUltimoConsumo(contrato?.id);

                    const ocupada = Boolean(contrato);

                    return (
                      <article className="kitnet-card" key={kitnet.id}>
                        <div className="kitnet-card-header">
                          <div className="kitnet-title-area">
                            <div className="kitnet-icon">⌂</div>

                            <div>
                              <span className="kitnet-number">KITNET</span>

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
                                    {formatarMoeda(ultimoConsumo.valor_energia)}
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

      {/* MODAL — ADICIONAR KITNET */}
      {mostrarFormulario && (
        <div
          className="kitnet-modal-background"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              fecharFormularioKitnet();
            }
          }}
        >
          <div className="kitnet-modal">
            <div className="kitnet-modal-header">
              <div>
                <span className="modal-eyebrow">NOVO IMÓVEL</span>

                <h2>Adicionar kitnet</h2>

                <p>Informe os dados básicos da kitnet.</p>
              </div>

              <button
                className="close-modal-button"
                onClick={fecharFormularioKitnet}
                disabled={salvandoKitnet}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <form className="kitnet-form" onSubmit={cadastrarKitnet}>
              <div className="form-field">
                <label htmlFor="numero-kitnet">Número da kitnet</label>

                <input
                  id="numero-kitnet"
                  type="text"
                  value={numeroKitnet}
                  onChange={(event) => setNumeroKitnet(event.target.value)}
                  placeholder="Ex.: 01"
                  disabled={salvandoKitnet}
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label htmlFor="valor-aluguel">Valor do aluguel</label>

                <div className="money-input">
                  <span>R$</span>

                  <input
                    id="valor-aluguel"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={valorAluguel}
                    onChange={(event) => setValorAluguel(event.target.value)}
                    placeholder="500,00"
                    disabled={salvandoKitnet}
                  />
                </div>
              </div>

              {erroKitnet && (
                <div className="kitnet-form-message error">{erroKitnet}</div>
              )}

              {mensagemKitnet && (
                <div className="kitnet-form-message success">
                  {mensagemKitnet}
                </div>
              )}

              <div className="kitnet-form-actions">
                <button
                  type="button"
                  className="cancel-kitnet-button"
                  onClick={fecharFormularioKitnet}
                  disabled={salvandoKitnet}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="save-kitnet-button"
                  disabled={salvandoKitnet}
                >
                  {salvandoKitnet ? "Salvando..." : "Cadastrar kitnet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Navbar />
    </div>
  );
}
