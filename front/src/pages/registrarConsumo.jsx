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
  return (
    MESES.find((mes) => mes.valor === Number(numero))?.nome ||
    numero
  );
}

function RegistrarConsumo() {
  const dataAtual = new Date();

  const [contratos, setContratos] = useState([]);
  const [inquilinos, setInquilinos] = useState([]);
  const [consumos, setConsumos] = useState([]);

  const [contratoId, setContratoId] = useState("");
  const [filtroInquilino, setFiltroInquilino] = useState("");

  const [mes, setMes] = useState(
    String(dataAtual.getMonth() + 1)
  );

  const [ano, setAno] = useState(
    dataAtual.getFullYear()
  );

  const [leituraAtual, setLeituraAtual] = useState("");
  const [precoKwh, setPrecoKwh] = useState("0.92");

  const [leituraAnterior, setLeituraAnterior] =
    useState(null);

  const [foto, setFoto] = useState(null);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [mensagem, setMensagem] =
    useState("");

  const [erro, setErro] =
    useState("");

  const [apagando, setApagando] =
    useState(null);

  const [confirmarExclusao, setConfirmarExclusao] =
    useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  // Busca os dados necessários para a tela.
  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [
        contratosResponse,
        inquilinosResponse,
        consumosResponse,
      ] = await Promise.all([
        api.get("/api/contratos"),
        api.get("/api/inquilinos"),
        api.get("/api/consumo/listar"),
      ]);

      setContratos(
        Array.isArray(contratosResponse.data)
          ? contratosResponse.data
          : []
      );

      setInquilinos(
        Array.isArray(inquilinosResponse.data)
          ? inquilinosResponse.data
          : []
      );

      setConsumos(
        Array.isArray(consumosResponse.data)
          ? consumosResponse.data
          : []
      );
    } catch (error) {
      console.error(
        "Erro ao carregar dados:",
        error
      );

      setErro(
        "Não foi possível carregar os dados."
      );
    } finally {
      setCarregando(false);
    }
  }

  // Escolhe a kitnet e encontra a última leitura dela.
  function selecionarContrato(id) {
    setContratoId(id);
    setMensagem("");
    setErro("");
    setLeituraAtual("");

    if (!id) {
      setLeituraAnterior(null);
      return;
    }

    const registros = consumos
      .filter(
        (consumo) =>
          Number(consumo.contrato_id) ===
          Number(id)
      )
      .sort((a, b) => {
        const dataA =
          Number(a.ano) * 100 +
          Number(a.mes);

        const dataB =
          Number(b.ano) * 100 +
          Number(b.mes);

        return dataB - dataA;
      });

    const ultimoConsumo = registros[0];

    setLeituraAnterior(
      ultimoConsumo
        ? Number(
            ultimoConsumo.leitura_atual
          )
        : 0
    );
  }

  // Registra uma nova leitura no backend.
  async function registrarConsumo(e) {
    e.preventDefault();

    if (!contratoId) {
      setErro("Selecione uma kitnet.");
      return;
    }

    if (leituraAtual === "") {
      setErro("Digite a leitura atual.");
      return;
    }

    if (
      Number(leituraAtual) <
      Number(leituraAnterior || 0)
    ) {
      setErro(
        "A leitura atual não pode ser menor que a leitura anterior."
      );

      return;
    }

    try {
      setSalvando(true);
      setMensagem("");
      setErro("");

      const response = await api.post(
        "/api/consumo/registrar",
        {
          contrato_id: Number(contratoId),
          mes: Number(mes),
          ano: Number(ano),
          leitura_atual: Number(leituraAtual),
          preco_kwh: Number(precoKwh),
        }
      );

      await carregarDados();

      setMensagem(
        response.data?.mensagem ||
          "Consumo registrado com sucesso!"
      );

      setLeituraAnterior(
        Number(leituraAtual)
      );

      setLeituraAtual("");
      setFoto(null);
    } catch (error) {
      console.error(
        "Erro ao registrar consumo:",
        error
      );

      setErro(
        error.response?.data?.erro ||
          "Não foi possível registrar o consumo."
      );
    } finally {
      setSalvando(false);
    }
  }

  // Abre a confirmação visual antes de excluir.
  function pedirExclusao(consumo) {
    setConfirmarExclusao(consumo);
    setErro("");
  }

  function fecharConfirmacao() {
    if (apagando !== null) return;

    setConfirmarExclusao(null);
  }

  // Exclui um registro de consumo.
  async function apagarConsumo() {
    if (!confirmarExclusao) return;

    const id = confirmarExclusao.id;

    try {
      setApagando(id);
      setErro("");
      setMensagem("");

      await api.delete(
        `/api/consumo/${id}`
      );

      setConsumos((lista) =>
        lista.filter(
          (item) => item.id !== id
        )
      );

      setMensagem(
        "Registro excluído com sucesso."
      );

      setConfirmarExclusao(null);
    } catch (error) {
      console.error(
        "Erro ao excluir consumo:",
        error
      );

      setErro(
        "Não foi possível excluir o registro."
      );

      setConfirmarExclusao(null);
    } finally {
      setApagando(null);
    }
  }

  // Abre a câmera do celular para fotografar o medidor.
  function tirarFoto(e) {
    const arquivo =
      e.target.files?.[0];

    if (!arquivo) return;

    const url =
      URL.createObjectURL(arquivo);

    setFoto(url);
  }

  const contratoSelecionado =
    contratos.find(
      (contrato) =>
        Number(contrato.id) ===
        Number(contratoId)
    );

  const inquilinoSelecionado =
    inquilinos.find(
      (inquilino) =>
        Number(inquilino.id) ===
        Number(
          contratoSelecionado?.inquilino_id
        )
    );

  // Filtra o histórico pelo inquilino escolhido.
  const historico = useMemo(() => {
    let lista = [...consumos];

    if (filtroInquilino) {
      const contratosDoInquilino =
        contratos
          .filter(
            (contrato) =>
              Number(
                contrato.inquilino_id
              ) ===
              Number(filtroInquilino)
          )
          .map((contrato) =>
            Number(contrato.id)
          );

      lista = lista.filter(
        (consumo) =>
          contratosDoInquilino.includes(
            Number(consumo.contrato_id)
          )
      );
    }

    return lista.sort((a, b) => {
      if (
        Number(a.ano) !==
        Number(b.ano)
      ) {
        return (
          Number(b.ano) -
          Number(a.ano)
        );
      }

      return (
        Number(b.mes) -
        Number(a.mes)
      );
    });
  }, [
    consumos,
    contratos,
    filtroInquilino,
  ]);

  // Calcula o consumo com base nas duas leituras.
  const consumoCalculado =
    useMemo(() => {
      if (
        leituraAtual === "" ||
        leituraAnterior === null ||
        Number(leituraAtual) <
          Number(leituraAnterior)
      ) {
        return 0;
      }

      return (
        Number(leituraAtual) -
        Number(leituraAnterior)
      );
    }, [
      leituraAtual,
      leituraAnterior,
    ]);

  const valorCalculado =
    consumoCalculado *
    Number(precoKwh || 0);

  function nomeDoInquilino(
    contratoIdDoHistorico
  ) {
    const contrato =
      contratos.find(
        (item) =>
          Number(item.id) ===
          Number(
            contratoIdDoHistorico
          )
      );

    const inquilino =
      inquilinos.find(
        (item) =>
          Number(item.id) ===
          Number(
            contrato?.inquilino_id
          )
      );

    return (
      inquilino?.nome ||
      "Inquilino não identificado"
    );
  }

  function numeroDaKitnet(
    contratoIdDoHistorico
  ) {
    const contrato =
      contratos.find(
        (item) =>
          Number(item.id) ===
          Number(
            contratoIdDoHistorico
          )
      );

    return (
      contrato?.kitnet_id || "-"
    );
  }

  return (
    <div className="consumo-page">

      <main className="consumo-content">

        {/* CABEÇALHO */}
        <header className="consumo-header">

          <div>
            <span className="consumo-eyebrow">
              CONTROLE DE ENERGIA
            </span>

            <h1>
              Energia
            </h1>

            <p>
              Registre a leitura e acompanhe o histórico.
            </p>
          </div>

          <div className="energy-header-icon">
            ⚡
          </div>

        </header>

        {carregando ? (

          <div className="consumo-loading">
            <div className="loading-circle"></div>

            <p>
              Carregando dados...
            </p>
          </div>

        ) : (

          <>

            {/* MENSAGEM DE ERRO */}
            {erro && (
              <div className="form-message error">
                <strong>
                  Ops!
                </strong>

                <span>
                  {erro}
                </span>
              </div>
            )}

            {/* MENSAGEM DE SUCESSO */}
            {mensagem && (
              <div className="form-message success">
                <strong>
                  ✓ Tudo certo!
                </strong>

                <span>
                  {mensagem}
                </span>
              </div>
            )}

            {/* FOTO DO MEDIDOR */}
            {foto && (
              <div className="photo-card">

                <div>
                  <strong>
                    Foto do medidor
                  </strong>

                  <span>
                    Use a foto para conferir a leitura.
                  </span>
                </div>

                <img
                  src={foto}
                  alt="Foto do medidor"
                />

              </div>
            )}

            {/* FORMULÁRIO */}
            <form
              className="consumo-form"
              onSubmit={registrarConsumo}
            >

              {/* 01 - IMÓVEL */}
              <section className="form-section">

                <div className="section-title">

                  <span className="section-number">
                    01
                  </span>

                  <div>
                    <strong>
                      Imóvel
                    </strong>

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
                    selecionarContrato(
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Selecione uma kitnet
                  </option>

                  {contratos.map(
                    (contrato) => (
                      <option
                        key={contrato.id}
                        value={contrato.id}
                      >
                        Kitnet{" "}
                        {contrato.kitnet_id}
                      </option>
                    )
                  )}
                </select>

                {contratoSelecionado && (
                  <div className="energy-tenant-card">

                    <div className="energy-tenant-icon">
                      👤
                    </div>

                    <div>
                      <span>
                        Inquilino
                      </span>

                      <strong>
                        {inquilinoSelecionado?.nome ||
                          `Inquilino #${contratoSelecionado.inquilino_id}`}
                      </strong>
                    </div>

                  </div>
                )}

              </section>

              {/* 02 - PERÍODO */}
              <section className="form-section">

                <div className="section-title">

                  <span className="section-number">
                    02
                  </span>

                  <div>
                    <strong>
                      Período
                    </strong>

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
                        setMes(
                          e.target.value
                        )
                      }
                      required
                    >
                      {MESES.map(
                        (item) => (
                          <option
                            key={item.valor}
                            value={item.valor}
                          >
                            {item.nome}
                          </option>
                        )
                      )}
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
                        setAno(
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>

              </section>

              {/* 03 - LEITURA */}
              <section className="form-section energy-reading-section">

                <div className="section-title">

                  <span className="section-number">
                    03
                  </span>

                  <div>
                    <strong>
                      Leitura do medidor
                    </strong>

                    <span>
                      Digite o número mostrado no relógio.
                    </span>
                  </div>

                </div>

                <div className="reading-card">

                  <div className="reading-row">

                    <span>
                      Leitura anterior
                    </span>

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

                  <div className="reading-input-line">

                    <div className="reading-input-wrapper">

                      <input
                        className="reading-input"
                        type="number"
                        min={
                          leituraAnterior ??
                          0
                        }
                        step="0.01"
                        value={
                          leituraAtual
                        }
                        onChange={(e) =>
                          setLeituraAtual(
                            e.target.value
                          )
                        }
                        placeholder="0"
                        required
                      />

                      <span>
                        kWh
                      </span>

                    </div>

                    {/* CÂMERA */}
                    <label
                      className="camera-button"
                      title="Tirar foto do medidor"
                    >

                      <span>
                        📷
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={tirarFoto}
                      />

                    </label>

                  </div>

                  <span className="camera-hint">
                    Você pode tirar uma foto para conferir o medidor.
                  </span>

                </div>

              </section>

              {/* 04 - VALOR */}
              <section className="form-section energy-value-section">

                <div className="section-title">

                  <span className="section-number">
                    04
                  </span>

                  <div>
                    <strong>
                      Valor da energia
                    </strong>

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

                      <span>
                        R$
                      </span>

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={
                          precoKwh
                        }
                        onChange={(e) =>
                          setPrecoKwh(
                            e.target.value
                          )
                        }
                        required
                      />

                      <span>
                        / kWh
                      </span>

                    </div>

                  </div>

                  <div className="calculation">

                    <div>

                      <span>
                        Consumo
                      </span>

                      <strong>
                        {consumoCalculado.toFixed(
                          2
                        )}{" "}
                        kWh
                      </strong>

                    </div>

                    <div className="calculation-energy">

                      <span>
                        Valor da energia
                      </span>

                      <strong className="calculation-total">
                        {formatarMoeda(
                          valorCalculado
                        )}
                      </strong>

                    </div>

                  </div>

                </div>

              </section>

              {/* BOTÃO REGISTRAR */}
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

                  <h2>
                    Histórico
                  </h2>

                </div>

                <span className="history-count">
                  {historico.length}
                </span>

              </div>

              {/* FILTRO */}
              <div className="history-filter">

                <label>
                  Ver histórico de
                </label>

                <select
                  className="field-control"
                  value={
                    filtroInquilino
                  }
                  onChange={(e) =>
                    setFiltroInquilino(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Todos os inquilinos
                  </option>

                  {inquilinos.map(
                    (inquilino) => (
                      <option
                        key={inquilino.id}
                        value={inquilino.id}
                      >
                        {inquilino.nome}
                      </option>
                    )
                  )}

                </select>

              </div>

              {historico.length === 0 ? (

                <div className="empty-history">

                  <div className="empty-history-icon">
                    ⚡
                  </div>

                  <h3>
                    Nenhum consumo registrado
                  </h3>

                  <p>
                    Os registros feitos aparecerão aqui.
                  </p>

                </div>

              ) : (

                <div className="history-list">

                  {historico.map(
                    (consumo) => (
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
                              {nomeDoMes(
                                consumo.mes
                              )}{" "}
                              {consumo.ano}
                            </strong>

                            <span>
                              {nomeDoInquilino(
                                consumo.contrato_id
                              )}{" "}
                              • Kitnet{" "}
                              {numeroDaKitnet(
                                consumo.contrato_id
                              )}
                            </span>

                            <small>
                              {consumo.consumo_kwh}{" "}
                              kWh
                            </small>

                          </div>

                        </div>

                        <div className="history-right">

                          <div className="history-value">

                            <span>
                              Energia
                            </span>

                            <strong>
                              {formatarMoeda(
                                consumo.valor_energia
                              )}
                            </strong>

                          </div>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              pedirExclusao(
                                consumo
                              )
                            }
                            disabled={
                              apagando ===
                              consumo.id
                            }
                            title="Excluir registro"
                          >
                            🗑️
                          </button>

                        </div>

                      </article>
                    )
                  )}

                </div>

              )}

            </section>

          </>
        )}

      </main>

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      {confirmarExclusao && (
        <div className="energy-confirm-background">

          <section className="energy-confirm-modal">

            <div className="energy-confirm-icon">
              🗑️
            </div>

            <h2>
              Excluir registro?
            </h2>

            <p>
              O registro de{" "}
              {nomeDoMes(
                confirmarExclusao.mes
              )}{" "}
              {confirmarExclusao.ano} será removido do histórico.
            </p>

            <div className="energy-confirm-actions">

              {/* AÇÃO PRINCIPAL À ESQUERDA */}
              <button
                type="button"
                className="energy-action-button danger"
                onClick={apagarConsumo}
                disabled={
                  apagando !== null
                }
              >
                {apagando !== null
                  ? "Excluindo..."
                  : "Excluir"}
              </button>

              {/* CANCELAR SEMPRE À DIREITA */}
              <button
                type="button"
                className="energy-action-button cancel"
                onClick={fecharConfirmacao}
                disabled={
                  apagando !== null
                }
              >
                Cancelar
              </button>

            </div>

          </section>

        </div>
      )}

      <Navbar />

    </div>
  );
}

export default RegistrarConsumo;