import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./registrarConsumo.css";

const MESES = [
  { valor: 1, nome: "Janeiro" },
  { valor: 2, nome: "Fevereiro" },
  { valor: 3, nome: "Março" },
  { valor: 4, nome: "Abril" },
  { valor: 5, nome: "Maio" },
  { valor: 6, nome: "Junho" },
  { valor: 7, nome: "Julho" },
  { valor: 8, nome: "Agosto" },
  { valor: 9, nome: "Setembro" },
  { valor: 10, nome: "Outubro" },
  { valor: 11, nome: "Novembro" },
  { valor: 12, nome: "Dezembro" },
];

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function nomeDoMes(numero) {
  return MESES.find((mes) => mes.valor === Number(numero))?.nome || numero;
}

function RegistrarConsumo() {
  const dataAtual = new Date();

  const [contratos, setContratos] = useState([]);
  const [inquilinos, setInquilinos] = useState([]);
  const [consumos, setConsumos] = useState([]);

  const [contratoId, setContratoId] = useState("");
  const [mes, setMes] = useState(String(dataAtual.getMonth() + 1));
  const [ano, setAno] = useState(dataAtual.getFullYear());
  const [leituraAtual, setLeituraAtual] = useState("");
  const [precoKwh, setPrecoKwh] = useState("0.92");

  const [leituraAnterior, setLeituraAnterior] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [contratosResponse, inquilinosResponse, consumosResponse] =
        await Promise.all([
          api.get("/api/contratos"),
          api.get("/api/inquilinos"),
          api.get("/api/consumo/listar"),
        ]);

      setContratos(
        Array.isArray(contratosResponse.data)
          ? contratosResponse.data
          : [],
      );

      setInquilinos(
        Array.isArray(inquilinosResponse.data)
          ? inquilinosResponse.data
          : [],
      );

      setConsumos(
        Array.isArray(consumosResponse.data)
          ? consumosResponse.data
          : [],
      );
    } catch (error) {
      console.error("Erro ao carregar dados:", error);

      setErro("Não foi possível carregar os dados.");
    } finally {
      setCarregando(false);
    }
  }

  async function selecionarContrato(id) {
    setContratoId(id);
    setMensagem("");
    setErro("");

    if (!id) {
      setLeituraAnterior(null);
      return;
    }

    try {
      const { data } = await api.get(`/api/consumo/contrato/${id}`);

      if (data) {
        setLeituraAnterior(Number(data.leitura_atual));
      } else {
        setLeituraAnterior(0);
      }
    } catch (error) {
      console.error("Erro ao buscar última leitura:", error);

      setLeituraAnterior(0);
    }
  }

  async function registrarConsumo(e) {
    e.preventDefault();

    if (!contratoId) {
      setErro("Selecione uma kitnet.");
      return;
    }

    if (Number(leituraAtual) < Number(leituraAnterior || 0)) {
      setErro(
        "A leitura atual não pode ser menor que a leitura anterior.",
      );
      return;
    }

    try {
      setSalvando(true);
      setMensagem("");
      setErro("");

      const response = await api.post("/api/consumo/registrar", {
        contrato_id: Number(contratoId),
        mes: Number(mes),
        ano: Number(ano),
        leitura_atual: Number(leituraAtual),
        preco_kwh: Number(precoKwh),
      });

      await carregarConsumos();

      setMensagem(
        response.data?.mensagem || "Consumo registrado com sucesso!",
      );

      setLeituraAnterior(Number(leituraAtual));
      setLeituraAtual("");
    } catch (error) {
      console.error("Erro ao registrar consumo:", error);

      setErro(
        error.response?.data?.erro ||
          "Não foi possível registrar o consumo.",
      );
    } finally {
      setSalvando(false);
    }
  }

  const contratoSelecionado = contratos.find(
    (contrato) => contrato.id === Number(contratoId),
  );

  const inquilinoSelecionado = inquilinos.find(
    (inquilino) =>
      Number(inquilino.id) ===
      Number(contratoSelecionado?.inquilino_id),
  );

  const consumoCalculado = useMemo(() => {
    if (
      leituraAtual === "" ||
      leituraAnterior === null ||
      Number(leituraAtual) < Number(leituraAnterior)
    ) {
      return 0;
    }

    return Number(leituraAtual) - Number(leituraAnterior);
  }, [leituraAtual, leituraAnterior]);

  const valorCalculado =
    consumoCalculado * Number(precoKwh || 0);

  return (
    <div className="consumo-page">
      <main className="consumo-content">
        {/* CABEÇALHO */}
        <header className="consumo-header">
          <div>
            <span className="consumo-eyebrow">
              CONTROLE DE ENERGIA
            </span>

            <h1>Registrar consumo</h1>

            <p>
              Informe a leitura atual do medidor.
            </p>
          </div>

          <div className="energy-header-icon">⚡</div>
        </header>

        {/* CARREGANDO */}
        {carregando ? (
          <div className="consumo-loading">
            <div className="loading-circle"></div>

            <p>Carregando dados...</p>
          </div>
        ) : (
          <>
            {/* MENSAGENS */}
            {erro && (
              <div className="form-message error">
                <strong>Ops!</strong>

                <span>{erro}</span>
              </div>
            )}

            {mensagem && (
              <div className="form-message success">
                <strong>✓ Tudo certo!</strong>

                <span>{mensagem}</span>
              </div>
            )}

            {/* FORMULÁRIO */}
            <form
              className="consumo-form"
              onSubmit={registrarConsumo}
            >
              {/* IMÓVEL */}
              <section className="form-section">
                <div className="section-title">
                  <span className="section-number">01</span>

                  <div>
                    <strong>Imóvel</strong>

                    <span>
                      Escolha a kitnet que será registrada.
                    </span>
                  </div>
                </div>

                <label className="field-label">
                  Kitnet
                </label>

                <select
                  className="field-control"
                  value={contratoId}
                  onChange={(e) =>
                    selecionarContrato(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Selecione uma kitnet
                  </option>

                  {contratos.map((contrato) => (
                    <option
                      key={contrato.id}
                      value={contrato.id}
                    >
                      Kitnet {contrato.kitnet_id}
                    </option>
                  ))}
                </select>

                {contratoSelecionado && (
                  <div className="tenant-card">
                    <div className="tenant-icon">👤</div>

                    <div>
                      <span>Inquilino</span>

                      <strong>
                        {inquilinoSelecionado?.nome ||
                          `Inquilino #${contratoSelecionado.inquilino_id}`}
                      </strong>
                    </div>
                  </div>
                )}
              </section>

              {/* PERÍODO */}
              <section className="form-section">
                <div className="section-title">
                  <span className="section-number">02</span>

                  <div>
                    <strong>Período</strong>

                    <span>
                      Em qual mês essa leitura foi feita?
                    </span>
                  </div>
                </div>

                <div className="period-grid">
                  <div>
                    <label className="field-label">
                      Mês
                    </label>

                    <select
                      className="field-control"
                      value={mes}
                      onChange={(e) =>
                        setMes(e.target.value)
                      }
                      required
                    >
                      {MESES.map((item) => (
                        <option
                          key={item.valor}
                          value={item.valor}
                        >
                          {item.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="field-label">
                      Ano
                    </label>

                    <input
                      className="field-control"
                      type="number"
                      value={ano}
                      onChange={(e) =>
                        setAno(e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </section>

              {/* LEITURA */}
              <section className="form-section">
                <div className="section-title">
                  <span className="section-number">03</span>

                  <div>
                    <strong>Leitura do medidor</strong>

                    <span>
                      Digite o número mostrado no relógio.
                    </span>
                  </div>
                </div>

                <div className="reading-card">
                  <div className="reading-row">
                    <span>Leitura anterior</span>

                    <strong>
                      {leituraAnterior === null
                        ? "—"
                        : `${leituraAnterior} kWh`}
                    </strong>
                  </div>

                  <div className="reading-divider"></div>

                  <label className="reading-label">
                    Leitura atual
                  </label>

                  <div className="reading-input-wrapper">
                    <input
                      className="reading-input"
                      type="number"
                      min={leituraAnterior ?? 0}
                      step="0.01"
                      value={leituraAtual}
                      onChange={(e) =>
                        setLeituraAtual(e.target.value)
                      }
                      placeholder="0"
                      required
                    />

                    <span>kWh</span>
                  </div>
                </div>
              </section>

              {/* VALOR */}
              <section className="form-section">
                <div className="section-title">
                  <span className="section-number">04</span>

                  <div>
                    <strong>Valor da energia</strong>

                    <span>
                      Confira o valor antes de registrar.
                    </span>
                  </div>
                </div>

                <div className="price-card">
                  <div className="price-field">
                    <label className="field-label">
                      Preço do kWh
                    </label>

                    <div className="money-input">
                      <span>R$</span>

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={precoKwh}
                        onChange={(e) =>
                          setPrecoKwh(e.target.value)
                        }
                        required
                      />
                      <span>/ kWh</span>
                    </div>
                  </div>

                  <div className="calculation">
                    <div>
                      <span>Consumo</span>

                      <strong>
                        {consumoCalculado.toFixed(2)} kWh
                      </strong>
                    </div>

                    <div>
                      <span>Valor da energia</span>

                      <strong className="calculation-total">
                        {formatarMoeda(valorCalculado)}
                      </strong>
                    </div>
                  </div>
                </div>
              </section>

              {/* BOTÃO */}
              <button
                type="submit"
                className="submit-button"
                disabled={salvando}
              >
                {salvando ? (
                  <>
                    <span className="button-spinner"></span>

                    Salvando...
                  </>
                ) : (
                  <>
                    ✓ Registrar leitura
                  </>
                )}
              </button>
            </form>

            {/* HISTÓRICO */}
            <section className="history-section">
              <div className="history-heading">
                <div>
                  <span className="consumo-eyebrow">
                    REGISTROS
                  </span>

                  <h2>Histórico</h2>
                </div>

                <span className="history-count">
                  {consumos.length}
                </span>
              </div>

              {consumos.length === 0 ? (
                <div className="empty-history">
                  <div className="empty-history-icon">
                    ⚡
                  </div>

                  <h3>Nenhum consumo registrado</h3>

                  <p>
                    Os registros feitos aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="history-list">
                  {consumos.map((consumo) => (
                    <article
                      className="history-card"
                      key={consumo.id}
                    >
                      <div className="history-main">
                        <div className="history-icon">
                          ⚡
                        </div>

                        <div>
                          <strong>
                            {nomeDoMes(consumo.mes)}{" "}
                            {consumo.ano}
                          </strong>

                          <span>
                            {consumo.consumo_kwh} kWh
                          </span>
                        </div>
                      </div>

                      <div className="history-value">
                        <span>Energia</span>

                        <strong>
                          {formatarMoeda(
                            consumo.valor_energia,
                          )}
                        </strong>
                      </div>
                    </article>
                  ))}
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

export default RegistrarConsumo;