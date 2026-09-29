import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./inquilinos.css";

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data) {
  if (!data) return "—";

  return new Date(data).toLocaleDateString("pt-BR");
}

function Inquilinos() {
  const navigate = useNavigate();

  const [inquilinos, setInquilinos] = useState([]);
  const [resumo, setResumo] = useState([]);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [editando, setEditando] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [acaoConfirmacao, setAcaoConfirmacao] = useState("");

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [processandoAcao, setProcessandoAcao] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  // Busca os inquilinos e o resumo dos contratos.
  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [inquilinosRes, resumoRes] = await Promise.all([
        api.get("/api/inquilinos"),
        api.get("/api/resumo/inquilinos"),
      ]);

      setInquilinos(
        Array.isArray(inquilinosRes.data) ? inquilinosRes.data : []
      );

      setResumo(Array.isArray(resumoRes.data) ? resumoRes.data : []);
    } catch (error) {
      console.error(error);

      // Se o resumo falhar, ainda tenta carregar os inquilinos.
      try {
        const resposta = await api.get("/api/inquilinos");

        setInquilinos(
          Array.isArray(resposta.data) ? resposta.data : []
        );
      } catch (err) {
        setErro("Não foi possível carregar os inquilinos.");
      }
    } finally {
      setCarregando(false);
    }
  }

  // Procura o resumo de um determinado inquilino.
  function pegarResumo(id) {
    return resumo.find(
      (item) => Number(item.inquilino_id) === Number(id)
    );
  }

  // Abre o formulário para cadastrar.
  function novoInquilino() {
    setEditando(null);
    setNome("");
    setTelefone("");
    setEmail("");

    setErro("");
    setMensagem("");

    setMostrarDetalhes(false);
    setMostrarForm(true);
  }

  // Abre o formulário para editar.
  function editarInquilino(inquilino) {
    setEditando(inquilino);

    setNome(inquilino.nome || "");
    setTelefone(inquilino.telefone || "");
    setEmail(inquilino.email || "");

    setErro("");
    setMensagem("");

    setMostrarDetalhes(false);
    setMostrarForm(true);
  }

  // Fecha o formulário.
  function fecharForm() {
    setMostrarForm(false);
    setEditando(null);

    setNome("");
    setTelefone("");
    setEmail("");

    setErro("");
  }

  // Salva um novo inquilino ou uma edição.
  async function salvarInquilino(e) {
    e.preventDefault();

    if (!nome.trim()) {
      setErro("Digite o nome do inquilino.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      const dados = {
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
      };

      if (editando) {
        await api.put(`/api/inquilino/${editando.id}`, dados);

        setMensagem("Inquilino atualizado com sucesso.");
      } else {
        await api.post("/api/inquilino/", dados);

        setMensagem("Inquilino cadastrado com sucesso.");
      }

      fecharForm();

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro(
        error.response?.data?.erro ||
          "Não foi possível salvar o inquilino."
      );
    } finally {
      setSalvando(false);
    }
  }

  // Abre os detalhes do inquilino.
  function abrirDetalhes(inquilino) {
    setSelecionado(inquilino);
    setMostrarDetalhes(true);
    setMostrarForm(false);

    setErro("");
  }

  // Abre a confirmação de uma ação.
  function pedirConfirmacao(acao) {
    setAcaoConfirmacao(acao);
    setMostrarConfirmacao(true);

    setErro("");
  }

  // Fecha a confirmação.
  function fecharConfirmacao() {
    if (processandoAcao) return;

    setMostrarConfirmacao(false);
    setAcaoConfirmacao("");
  }

  // Exclui o inquilino.
  async function excluirInquilino() {
    if (!selecionado) return;

    try {
      setProcessandoAcao(true);
      setErro("");
      setMensagem("");

      await api.delete(`/api/inquilino/${selecionado.id}`);

      setMensagem("Inquilino excluído com sucesso.");

      setMostrarConfirmacao(false);
      setMostrarDetalhes(false);
      setSelecionado(null);

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro(
        error.response?.data?.erro ||
          "Não foi possível excluir o inquilino."
      );

      setMostrarConfirmacao(false);
    } finally {
      setProcessandoAcao(false);
    }
  }

  // Encerra o contrato atual.
  async function encerrarContrato() {
    const dados = selecionado
      ? pegarResumo(selecionado.id)
      : null;

    if (!dados?.contrato_id) {
      setErro("Esse inquilino não possui contrato.");
      setMostrarConfirmacao(false);
      return;
    }

    try {
      setProcessandoAcao(true);
      setErro("");
      setMensagem("");

      await api.put(`/api/contratos/${dados.contrato_id}`, {
        inquilinoId: dados.inquilino_id,
        kitnetId: dados.kitnet_id,
        dataInicio: dados.data_inicio,
        dataFim: new Date().toISOString(),
      });

      setMensagem("Contrato encerrado com sucesso.");

      setMostrarConfirmacao(false);

      await carregarDados();

      const novoSelecionado = inquilinos.find(
        (item) =>
          Number(item.id) === Number(dados.inquilino_id)
      );

      if (novoSelecionado) {
        setSelecionado(novoSelecionado);
      }
    } catch (error) {
      console.error(error);

      setErro(
        error.response?.data?.erro ||
          "Não foi possível encerrar o contrato."
      );

      setMostrarConfirmacao(false);
    } finally {
      setProcessandoAcao(false);
    }
  }

  // Decide qual ação deve ser executada.
  function executarAcao() {
    if (acaoConfirmacao === "excluir") {
      excluirInquilino();
      return;
    }

    if (acaoConfirmacao === "encerrar") {
      encerrarContrato();
    }
  }

  const dadosSelecionado = selecionado
    ? pegarResumo(selecionado.id)
    : null;

  const contratoAtivo = dadosSelecionado?.data_fim == null;

  return (
    <div className="app-container">
      <main className="main-content">

        {/* CABEÇALHO */}
        <header className="tenant-header">
          <div>
            <span className="tenant-eyebrow">
              GESTÃO
            </span>

            <h1 className="page-title">
              Inquilinos
            </h1>

            <p className="page-subtitle">
              Pessoas cadastradas e seus contratos.
            </p>
          </div>

          <button
            className="tenant-add"
            onClick={novoInquilino}
            type="button"
          >
            <span>+</span>
            <span>Adicionar</span>
          </button>
        </header>

        {/* MENSAGEM DE ERRO */}
        {erro && (
          <div className="tenant-message error">
            {erro}
          </div>
        )}

        {/* MENSAGEM DE SUCESSO */}
        {mensagem && (
          <div className="tenant-message success">
            ✓ {mensagem}
          </div>
        )}

        {/* FORMULÁRIO */}
        {mostrarForm && (
          <section className="tenant-form card">

            <div className="form-top">
              <div>
                <span className="form-label-small">
                  {editando
                    ? "EDITAR"
                    : "NOVO CADASTRO"}
                </span>

                <h2>
                  {editando
                    ? "Editar inquilino"
                    : "Novo inquilino"}
                </h2>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={fecharForm}
                aria-label="Fechar formulário"
              >
                ×
              </button>
            </div>

            <form onSubmit={salvarInquilino}>

              <div className="form-group">
                <label className="form-label">
                  Nome
                </label>

                <input
                  className="form-input"
                  type="text"
                  value={nome}
                  onChange={(e) =>
                    setNome(e.target.value)
                  }
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Telefone
                </label>

                <input
                  className="form-input"
                  type="tel"
                  value={telefone}
                  onChange={(e) =>
                    setTelefone(e.target.value)
                  }
                  placeholder="(42) 99999-9999"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  E-mail
                </label>

                <input
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="email@exemplo.com"
                />
              </div>

              {/* AÇÃO À ESQUERDA / CANCELAR À DIREITA */}
              <div className="form-actions">

                <button
                  className="tenant-button primary"
                  type="submit"
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando..."
                    : editando
                    ? "Salvar alterações"
                    : "Cadastrar inquilino"}
                </button>

                <button
                  className="tenant-button cancel"
                  type="button"
                  onClick={fecharForm}
                  disabled={salvando}
                >
                  Cancelar
                </button>

              </div>
            </form>
          </section>
        )}

        {/* CARREGANDO */}
        {carregando ? (
          <div className="tenant-empty card">
            <span>
              Carregando inquilinos...
            </span>
          </div>
        ) : inquilinos.length === 0 ? (

          /* NENHUM INQUILINO */
          <div className="tenant-empty card">

            <div className="empty-icon">
              👤
            </div>

            <strong>
              Nenhum inquilino cadastrado
            </strong>

            <span>
              Use o botão Adicionar para cadastrar o primeiro.
            </span>
          </div>

        ) : (

          /* LISTA */
          <>
            <div className="tenant-count">
              <strong>
                {inquilinos.length}
              </strong>

              <span>
                {inquilinos.length === 1
                  ? " inquilino cadastrado"
                  : " inquilinos cadastrados"}
              </span>
            </div>

            <section className="tenant-list">

              {inquilinos.map((inquilino) => {

                const dados =
                  pegarResumo(inquilino.id);

                const ativo =
                  dados?.data_fim == null;

                return (
                  <article
                    className="tenant-card card"
                    key={inquilino.id}
                  >

                    <div className="tenant-card-top">

                      <div className="tenant-avatar">
                        👤
                      </div>

                      <div className="tenant-name">

                        <h2>
                          {inquilino.nome}
                        </h2>

                        <span
                          className={
                            ativo
                              ? "status status-active"
                              : "status status-ended"
                          }
                        >
                          {ativo
                            ? "Contrato ativo"
                            : "Contrato encerrado"}
                        </span>

                      </div>
                    </div>

                    <div className="tenant-info">

                      {dados?.kitnet_numero && (
                        <div className="info-line">
                          <span>🏠</span>

                          <strong>
                            Kitnet {dados.kitnet_numero}
                          </strong>
                        </div>
                      )}

                      {inquilino.telefone && (
                        <div className="info-line">
                          <span>📞</span>

                          <span>
                            {inquilino.telefone}
                          </span>
                        </div>
                      )}

                      {inquilino.email && (
                        <div className="info-line">
                          <span>✉️</span>

                          <span>
                            {inquilino.email}
                          </span>
                        </div>
                      )}

                    </div>

                    {/* ÚLTIMO CONSUMO */}
                    {dados?.consumo && (
                      <div className="last-consumption">

                        <div>
                          <span>
                            ⚡ Último consumo
                          </span>

                          <strong>
                            {dados.consumo.consumo_kwh} kWh
                          </strong>
                        </div>

                        <div>
                          <span>
                            Valor da energia
                          </span>

                          <strong>
                            {formatarMoeda(
                              dados.consumo.valor_energia
                            )}
                          </strong>
                        </div>

                      </div>
                    )}

                    {/* ÚNICA AÇÃO PRINCIPAL DO CARD */}
                    <button
                      className="view-tenant-button"
                      type="button"
                      onClick={() =>
                        abrirDetalhes(inquilino)
                      }
                    >
                      Ver inquilino
                      <span>→</span>
                    </button>

                  </article>
                );
              })}

            </section>
          </>
        )}

      </main>

      {/* DETALHES DO INQUILINO */}
      {mostrarDetalhes && selecionado && (
        <div className="modal-background">

          <section className="tenant-modal">

            <div className="modal-header">

              <div className="modal-person">

                <div className="tenant-avatar large">
                  👤
                </div>

                <div>
                  <span className="tenant-eyebrow">
                    INQUILINO
                  </span>

                  <h2>
                    {selecionado.nome}
                  </h2>
                </div>

              </div>

              <button
                className="close-button"
                type="button"
                onClick={() =>
                  setMostrarDetalhes(false)
                }
                aria-label="Fechar detalhes"
              >
                ×
              </button>

            </div>

            {/* DADOS */}
            <div className="detail-box">

              <div className="detail-title">
                <span>👤</span>
                <h3>Dados</h3>
              </div>

              <div className="detail-line">
                <span>Telefone</span>

                <strong>
                  {selecionado.telefone ||
                    "Não informado"}
                </strong>
              </div>

              <div className="detail-line">
                <span>E-mail</span>

                <strong>
                  {selecionado.email ||
                    "Não informado"}
                </strong>
              </div>

            </div>

            {/* MORADIA / CONTRATO */}
            <div className="detail-box">

              <div className="detail-title">
                <span>🏠</span>
                <h3>
                  Moradia / Contrato
                </h3>
              </div>

              {dadosSelecionado ? (
                <>
                  <div className="detail-line">
                    <span>Kitnet</span>

                    <strong>
                      Kitnet{" "}
                      {dadosSelecionado.kitnet_numero}
                    </strong>
                  </div>

                  <div className="detail-line">
                    <span>Aluguel</span>

                    <strong>
                      {formatarMoeda(
                        dadosSelecionado.valor_aluguel
                      )}{" "}
                      / mês
                    </strong>
                  </div>

                  <div className="detail-line">
                    <span>Início</span>

                    <strong>
                      {formatarData(
                        dadosSelecionado.data_inicio
                      )}
                    </strong>
                  </div>

                  <div className="detail-line">
                    <span>Status</span>

                    <strong>
                      <span
                        className={
                          contratoAtivo
                            ? "status status-active"
                            : "status status-ended"
                        }
                      >
                        {contratoAtivo
                          ? "Contrato ativo"
                          : "Contrato encerrado"}
                      </span>
                    </strong>
                  </div>

                  {!contratoAtivo && (
                    <div className="detail-line">
                      <span>Fim</span>

                      <strong>
                        {formatarData(
                          dadosSelecionado.data_fim
                        )}
                      </strong>
                    </div>
                  )}
                </>
              ) : (
                <p className="detail-empty">
                  Nenhum contrato encontrado.
                </p>
              )}

            </div>

            {/* ENERGIA */}
            <div className="detail-box energy-box">

              <div className="detail-title energy-title">
                <span>⚡</span>

                <h3>
                  Energia
                </h3>
              </div>

              {dadosSelecionado?.consumo ? (

                <div className="energy-highlight">

                  <div>
                    <span>
                      Último consumo
                    </span>

                    <strong>
                      {dadosSelecionado.consumo.consumo_kwh}{" "}
                      kWh
                    </strong>
                  </div>

                  <div>
                    <span>
                      Valor da energia
                    </span>

                    <strong>
                      {formatarMoeda(
                        dadosSelecionado.consumo.valor_energia
                      )}
                    </strong>
                  </div>

                </div>

              ) : (

                <p className="detail-empty">
                  Nenhum consumo registrado.
                </p>

              )}

            </div>

            {/* AÇÕES */}
            <div className="modal-actions">

              <button
                className="tenant-button primary"
                type="button"
                onClick={() =>
                  editarInquilino(selecionado)
                }
              >
                Editar informações
              </button>

              <button
                className="tenant-button secondary"
                type="button"
                onClick={() =>
                  navigate("/consulta")
                }
              >
                Ver histórico de energia
              </button>

              {dadosSelecionado &&
                contratoAtivo && (
                  <button
                    className="more-button"
                    type="button"
                    onClick={() =>
                      pedirConfirmacao("encerrar")
                    }
                  >
                    Encerrar contrato
                    <span>›</span>
                  </button>
                )}

              <button
                className="more-button danger-link"
                type="button"
                onClick={() =>
                  pedirConfirmacao("excluir")
                }
              >
                Excluir inquilino
                <span>›</span>
              </button>

            </div>

          </section>
        </div>
      )}

      {/* CONFIRMAÇÃO */}
      {mostrarConfirmacao && selecionado && (
        <div className="confirm-background">

          <section className="confirm-modal">

            <div className="confirm-icon">
              {acaoConfirmacao === "excluir"
                ? "🗑️"
                : "⚠️"}
            </div>

            <h2>
              {acaoConfirmacao === "excluir"
                ? "Excluir inquilino?"
                : "Encerrar contrato?"}
            </h2>

            <p>
              {acaoConfirmacao === "excluir"
                ? `${selecionado.nome} será removido do sistema.`
                : `O contrato de ${selecionado.nome} será encerrado.`}
            </p>

            {/* AÇÃO À ESQUERDA / CANCELAR À DIREITA */}
            <div className="confirm-actions">

              <button
                className={
                  acaoConfirmacao === "excluir"
                    ? "tenant-button danger"
                    : "tenant-button primary"
                }
                type="button"
                onClick={executarAcao}
                disabled={processandoAcao}
              >
                {processandoAcao
                  ? "Aguarde..."
                  : acaoConfirmacao === "excluir"
                  ? "Excluir"
                  : "Encerrar contrato"}
              </button>

              <button
                className="tenant-button cancel"
                type="button"
                onClick={fecharConfirmacao}
                disabled={processandoAcao}
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

export default Inquilinos;
