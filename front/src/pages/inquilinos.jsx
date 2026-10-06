import { useEffect, useState } from "react";
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
  const [inquilinos, setInquilinos] = useState([]);
  const [resumo, setResumo] = useState([]);
  const [kitnets, setKitnets] = useState([]);
  const [contratos, setContratos] = useState([]);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  const [editando, setEditando] = useState(null);
  const [selecionado, setSelecionado] = useState(null);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [kitnetId, setKitnetId] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  // Busca todos os dados necessários para a tela.
  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [inquilinosRes, resumoRes, kitnetsRes, contratosRes] =
        await Promise.all([
          api.get("/api/inquilino/listar"),
          api.get("/api/resumo/inquilinos"),
          api.get("/api/kitnet/listar"),
          api.get("/api/contratos"),
        ]);

      setInquilinos(
        Array.isArray(inquilinosRes.data) ? inquilinosRes.data : [],
      );

      setResumo(Array.isArray(resumoRes.data) ? resumoRes.data : []);

      setKitnets(Array.isArray(kitnetsRes.data) ? kitnetsRes.data : []);

      setContratos(Array.isArray(contratosRes.data) ? contratosRes.data : []);
    } catch (error) {
      console.error(error);

      setErro(
        error.response?.data?.erro || "Não foi possível carregar os dados.",
      );
    } finally {
      setCarregando(false);
    }
  }

  // Verifica se a kitnet possui contrato ativo.
  function kitnetEstaOcupada(id) {
    return contratos.some(
      (contrato) =>
        Number(contrato.kitnet_id) === Number(id) && !contrato.data_fim,
    );
  }

  // Retorna somente as kitnets disponíveis.
  // Na edição, mantém também a kitnet atual do inquilino.
  function kitnetsDisponiveis() {
    const contratoAtual = editando
      ? resumo.find((item) => Number(item.inquilino_id) === Number(editando.id))
      : null;

    const kitnetAtualId = contratoAtual?.kitnet_id;

    return kitnets.filter((kitnet) => {
      const ocupada = kitnetEstaOcupada(kitnet.id);

      const eAtual = Number(kitnet.id) === Number(kitnetAtualId);

      return !ocupada || eAtual;
    });
  }

  // Abre o formulário para adicionar.
  function novoInquilino() {
    setEditando(null);

    setNome("");
    setTelefone("");
    setEmail("");
    setKitnetId("");

    setErro("");
    setMensagem("");

    setMostrarDetalhes(false);
    setMostrarForm(true);
  }

  // Abre o formulário para editar.
  function editarInquilino(inquilino) {
    const dados = pegarResumo(inquilino.id);

    setEditando(inquilino);

    setNome(inquilino.nome || "");
    setTelefone(inquilino.telefone || "");
    setEmail(inquilino.email || "");

    setKitnetId(dados?.kitnet_id ? String(dados.kitnet_id) : "");

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
    setKitnetId("");

    setErro("");
  }

  // Salva um inquilino novo ou editado.
  async function salvarInquilino(e) {
    e.preventDefault();

    if (!nome.trim()) {
      setErro("Digite o nome do inquilino.");
      return;
    }

    if (!kitnetId) {
      setErro("Selecione uma kitnet.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      const dadosInquilino = {
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
      };

      if (editando) {
        // Primeiro atualiza os dados pessoais.
        await api.put(`/api/inquilino/${editando.id}`, dadosInquilino);

        const dadosContrato = pegarResumo(editando.id);

        if (dadosContrato?.contrato_id) {
          // Atualiza a kitnet do contrato.
          await api.put(`/api/contratos/${dadosContrato.contrato_id}`, {
            inquilinoId: editando.id,
            kitnetId: Number(kitnetId),
            dataInicio: dadosContrato.data_inicio,
            dataFim: dadosContrato.data_fim || null,
          });
        } else {
          // Caso o inquilino não tenha contrato,
          // cria um novo contrato.
          await api.post("/api/contratos/", {
            inquilinoId: editando.id,
            kitnetId: Number(kitnetId),
            dataInicio: new Date().toISOString(),
            dataFim: null,
          });
        }

        setMensagem("Inquilino atualizado com sucesso!");
      } else {
        // Primeiro cria o inquilino.
        const resposta = await api.post("/api/inquilino/", dadosInquilino);

        const novoInquilino = resposta.data;

        // Depois cria o contrato ligando
        // o novo inquilino à kitnet.
        await api.post("/api/contratos/", {
          inquilinoId: novoInquilino.id,
          kitnetId: Number(kitnetId),
          dataInicio: new Date().toISOString(),
          dataFim: null,
        });

        setMensagem("Inquilino cadastrado com sucesso!");
      }

      fecharForm();
      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro(
        error.response?.data?.erro || "Não foi possível salvar o inquilino.",
      );
    } finally {
      setSalvando(false);
    }
  }

  // Abre os detalhes.
  function abrirDetalhes(inquilino) {
    setSelecionado(inquilino);
    setMostrarDetalhes(true);
    setMostrarForm(false);
    setErro("");
  }

  // Exclui um inquilino.
  async function excluirInquilino(inquilino) {
    const confirmou = window.confirm(`Excluir ${inquilino.nome}?`);

    if (!confirmou) return;

    try {
      setErro("");
      setMensagem("");

      await api.delete(`/api/inquilino/${inquilino.id}`);

      setMensagem("Inquilino excluído com sucesso.");

      setMostrarDetalhes(false);
      setSelecionado(null);

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro(
        error.response?.data?.erro || "Não foi possível excluir o inquilino.",
      );
    }
  }

  // Encerra o contrato atual.
  async function encerrarContrato(dados) {
    if (!dados?.contrato_id) {
      setErro("Esse inquilino não possui contrato.");
      return;
    }

    const confirmou = window.confirm(`Encerrar o contrato de ${dados.nome}?`);

    if (!confirmou) return;

    try {
      setErro("");
      setMensagem("");

      await api.put(`/api/contratos/${dados.contrato_id}`, {
        inquilinoId: dados.inquilino_id,
        kitnetId: dados.kitnet_id,
        dataInicio: dados.data_inicio,
        dataFim: new Date().toISOString(),
      });

      setMensagem("Contrato encerrado com sucesso.");

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro(
        error.response?.data?.erro || "Não foi possível encerrar o contrato.",
      );
    }
  }

  // Pega as informações extras do inquilino.
  function pegarResumo(id) {
    return resumo.find((item) => Number(item.inquilino_id) === Number(id));
  }

  return (
    <div className="app-container">
      <main className="main-content">
        {/* Cabeçalho */}
        <header className="tenant-header">
          <div>
            <span className="tenant-eyebrow">GESTÃO</span>

            <h1 className="page-title">Inquilinos</h1>

            <p className="page-subtitle">
              Pessoas cadastradas e seus contratos.
            </p>
          </div>

          <button className="tenant-add" onClick={novoInquilino} type="button">
            +
          </button>
        </header>

        {/* Mensagens */}
        {erro && <div className="tenant-message error">{erro}</div>}

        {mensagem && <div className="tenant-message success">✓ {mensagem}</div>}

        {/* Formulário */}
        {mostrarForm && (
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
                onClick={fecharForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={salvarInquilino}>
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

                  {kitnetsDisponiveis().map((kitnet) => (
                    <option key={kitnet.id} value={kitnet.id}>
                      Kitnet {kitnet.numero}
                      {" — "}
                      {formatarMoeda(kitnet.valor_aluguel)}
                    </option>
                  ))}
                </select>

                {kitnetsDisponiveis().length === 0 && (
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
                disabled={salvando || kitnetsDisponiveis().length === 0}
              >
                {salvando
                  ? "Salvando..."
                  : editando
                    ? "Salvar alterações"
                    : "Cadastrar inquilino"}
              </button>
            </form>
          </section>
        )}

        {/* Lista */}
        {carregando ? (
          <div className="tenant-empty card">
            <span>Carregando inquilinos...</span>
          </div>
        ) : inquilinos.length === 0 ? (
          <div className="tenant-empty card">
            <div className="empty-icon">👤</div>

            <strong>Nenhum inquilino cadastrado</strong>

            <span>Use o botão + para cadastrar o primeiro.</span>
          </div>
        ) : (
          <>
            <div className="tenant-count">
              <strong>{inquilinos.length}</strong>

              <span>
                {inquilinos.length === 1
                  ? " inquilino cadastrado"
                  : " inquilinos cadastrados"}
              </span>
            </div>

            <section className="tenant-list">
              {inquilinos.map((inquilino) => {
                const dados = pegarResumo(inquilino.id);

                const ativo = dados?.data_fim == null;

                return (
                  <article className="tenant-card card" key={inquilino.id}>
                    <div className="tenant-card-top">
                      <div className="tenant-avatar">👤</div>

                      <div className="tenant-name">
                        <h2>{inquilino.nome}</h2>

                        <span
                          className={
                            ativo
                              ? "status status-active"
                              : "status status-ended"
                          }
                        >
                          {ativo ? "Contrato ativo" : "Contrato encerrado"}
                        </span>
                      </div>
                    </div>

                    <div className="tenant-info">
                      {dados?.kitnet_numero && (
                        <div className="info-line">
                          <span>🏠</span>

                          <strong>Kitnet {dados.kitnet_numero}</strong>
                        </div>
                      )}

                      {inquilino.telefone && (
                        <div className="info-line">
                          <span>📞</span>

                          <span>{inquilino.telefone}</span>
                        </div>
                      )}

                      {inquilino.email && (
                        <div className="info-line">
                          <span>✉️</span>

                          <span>{inquilino.email}</span>
                        </div>
                      )}
                    </div>

                    {dados?.consumo && (
                      <div className="last-consumption">
                        <div>
                          <span>Último consumo</span>

                          <strong>{dados.consumo.consumo_kwh} kWh</strong>
                        </div>

                        <div>
                          <span>Energia</span>

                          <strong>
                            {formatarMoeda(dados.consumo.valor_energia)}
                          </strong>
                        </div>
                      </div>
                    )}

                    <div className="tenant-actions">
                      <button
                        className="action-button primary"
                        type="button"
                        onClick={() => abrirDetalhes(inquilino)}
                      >
                        Ver detalhes
                      </button>

                      <button
                        className="action-button"
                        type="button"
                        onClick={() => editarInquilino(inquilino)}
                      >
                        Editar
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </main>

      {/* Detalhes */}
      {mostrarDetalhes && selecionado && (
        <div className="modal-background">
          <section className="tenant-modal">
            <div className="modal-header">
              <div className="modal-person">
                <div className="tenant-avatar large">👤</div>

                <div>
                  <span className="tenant-eyebrow">INQUILINO</span>

                  <h2>{selecionado.nome}</h2>
                </div>
              </div>

              <button
                className="close-button"
                type="button"
                onClick={() => setMostrarDetalhes(false)}
              >
                ×
              </button>
            </div>

            {(() => {
              const dados = pegarResumo(selecionado.id);

              const ativo = dados?.data_fim == null;

              return (
                <>
                  <div className="detail-box">
                    <h3>Dados</h3>

                    <div className="detail-line">
                      <span>Telefone</span>

                      <strong>{selecionado.telefone || "Não informado"}</strong>
                    </div>

                    <div className="detail-line">
                      <span>E-mail</span>

                      <strong>{selecionado.email || "Não informado"}</strong>
                    </div>
                  </div>

                  <div className="detail-box">
                    <h3>Contrato</h3>

                    {dados ? (
                      <>
                        <div className="detail-line">
                          <span>Kitnet</span>

                          <strong>Kitnet {dados.kitnet_numero}</strong>
                        </div>

                        <div className="detail-line">
                          <span>Início</span>

                          <strong>{formatarData(dados.data_inicio)}</strong>
                        </div>

                        <div className="detail-line">
                          <span>Fim</span>

                          <strong>
                            {dados.data_fim
                              ? formatarData(dados.data_fim)
                              : "Contrato ativo"}
                          </strong>
                        </div>

                        {dados.consumo && (
                          <div className="detail-line">
                            <span>Último consumo</span>

                            <strong>{dados.consumo.consumo_kwh} kWh</strong>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="detail-empty">
                        Nenhum contrato encontrado.
                      </p>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => editarInquilino(selecionado)}
                    >
                      ✏️ Editar dados
                    </button>

                    {dados && ativo && (
                      <button
                        className="btn btn-warning"
                        type="button"
                        onClick={() => encerrarContrato(dados)}
                      >
                        🚪 Encerrar contrato
                      </button>
                    )}

                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={() => excluirInquilino(selecionado)}
                    >
                      🗑️ Excluir inquilino
                    </button>
                  </div>
                </>
              );
            })()}
          </section>
        </div>
      )}

      <Navbar />
    </div>
  );
}

export default Inquilinos;
