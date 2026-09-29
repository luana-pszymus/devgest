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

  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarDetalhes, setMostrarDetalhes] =
    useState(false);

  const [editando, setEditando] = useState(null);
  const [selecionado, setSelecionado] = useState(null);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  // Busca os inquilinos e o resumo
  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [inquilinosRes, resumoRes] =
        await Promise.all([
          api.get("/api/inquilinos"),
          api.get("/api/resumo/inquilinos"),
        ]);

      setInquilinos(
        Array.isArray(inquilinosRes.data)
          ? inquilinosRes.data
          : [],
      );

      setResumo(
        Array.isArray(resumoRes.data)
          ? resumoRes.data
          : [],
      );
    } catch (error) {
      console.error(error);

      // Tenta carregar pelo menos os inquilinos
      try {
        const resposta = await api.get(
          "/api/inquilinos",
        );

        setInquilinos(
          Array.isArray(resposta.data)
            ? resposta.data
            : [],
        );
      } catch (err) {
        setErro(
          "Não foi possível carregar os inquilinos.",
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  // Abre o formulário para adicionar
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

  // Abre o formulário para editar
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

  // Fecha o formulário
  function fecharForm() {
    setMostrarForm(false);
    setEditando(null);

    setNome("");
    setTelefone("");
    setEmail("");

    setErro("");
  }

  // Salva um inquilino novo ou editado
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
        await api.put(
          `/api/inquilino/${editando.id}`,
          dados,
        );

        setMensagem(
          "Inquilino atualizado com sucesso!",
        );
      } else {
        await api.post(
          "/api/inquilino/",
          dados,
        );

        setMensagem(
          "Inquilino cadastrado com sucesso!",
        );
      }

      fecharForm();
      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro(
        error.response?.data?.erro ||
          "Não foi possível salvar o inquilino.",
      );
    } finally {
      setSalvando(false);
    }
  }

  // Abre os detalhes
  function abrirDetalhes(inquilino) {
    setSelecionado(inquilino);
    setMostrarDetalhes(true);
    setMostrarForm(false);
    setErro("");
  }

  // Exclui um inquilino
  async function excluirInquilino(inquilino) {
    const confirmou = window.confirm(
      `Excluir ${inquilino.nome}?`,
    );

    if (!confirmou) return;

    try {
      setErro("");
      setMensagem("");

      await api.delete(
        `/api/inquilino/${inquilino.id}`,
      );

      setMensagem(
        "Inquilino excluído com sucesso.",
      );

      setMostrarDetalhes(false);
      setSelecionado(null);

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro(
        error.response?.data?.erro ||
          "Não foi possível excluir o inquilino.",
      );
    }
  }

  // Encerra o contrato atual
  async function encerrarContrato(dados) {
    if (!dados?.contrato_id) {
      setErro("Esse inquilino não possui contrato.");
      return;
    }

    const confirmou = window.confirm(
      `Encerrar o contrato de ${dados.nome}?`,
    );

    if (!confirmou) return;

    try {
      setErro("");
      setMensagem("");

      await api.put(
        `/api/contratos/${dados.contrato_id}`,
        {
          inquilinoId: dados.inquilino_id,
          kitnetId: dados.kitnet_id,
          dataInicio: dados.data_inicio,
          dataFim: new Date().toISOString(),
        },
      );

      setMensagem(
        "Contrato encerrado com sucesso.",
      );

      await carregarDados();

      const novoResumo = resumo.find(
        (item) =>
          Number(item.inquilino_id) ===
          Number(dados.inquilino_id),
      );

      if (novoResumo) {
        setSelecionado(
          inquilinos.find(
            (item) =>
              Number(item.id) ===
              Number(dados.inquilino_id),
          ),
        );
      }
    } catch (error) {
      console.error(error);

      setErro(
        error.response?.data?.erro ||
          "Não foi possível encerrar o contrato.",
      );
    }
  }

  // Pega as informações extras do inquilino
  function pegarResumo(id) {
    return resumo.find(
      (item) =>
        Number(item.inquilino_id) ===
        Number(id),
    );
  }

  return (
    <div className="app-container">

      <main className="main-content">

        {/* Cabeçalho */}
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
            +
          </button>
        </header>

        {/* Mensagens */}
        {erro && (
          <div className="tenant-message error">
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="tenant-message success">
            ✓ {mensagem}
          </div>
        )}

        {/* Formulário */}
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

              <button
                className="btn btn-primary"
                type="submit"
                disabled={salvando}
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

            <div className="empty-icon">
              👤
            </div>

            <strong>
              Nenhum inquilino cadastrado
            </strong>

            <span>
              Use o botão + para cadastrar o primeiro.
            </span>

          </div>
        ) : (
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
                const dados = pegarResumo(
                  inquilino.id,
                );

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
                            Kitnet{" "}
                            {dados.kitnet_numero}
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

                    {dados?.consumo && (
                      <div className="last-consumption">

                        <div>
                          <span>
                            Último consumo
                          </span>

                          <strong>
                            {dados.consumo.consumo_kwh}{" "}
                            kWh
                          </strong>
                        </div>

                        <div>
                          <span>
                            Energia
                          </span>

                          <strong>
                            {formatarMoeda(
                              dados.consumo
                                .valor_energia,
                            )}
                          </strong>
                        </div>

                      </div>
                    )}

                    <div className="tenant-actions">

                      <button
                        className="action-button primary"
                        type="button"
                        onClick={() =>
                          abrirDetalhes(
                            inquilino,
                          )
                        }
                      >
                        Ver detalhes
                      </button>

                      <button
                        className="action-button"
                        type="button"
                        onClick={() =>
                          editarInquilino(
                            inquilino,
                          )
                        }
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
              >
                ×
              </button>

            </div>

            {(() => {
              const dados = pegarResumo(
                selecionado.id,
              );

              const ativo =
                dados?.data_fim == null;

              return (
                <>
                  <div className="detail-box">

                    <h3>Dados</h3>

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

                  <div className="detail-box">

                    <h3>Contrato</h3>

                    {dados ? (
                      <>
                        <div className="detail-line">
                          <span>Kitnet</span>

                          <strong>
                            Kitnet{" "}
                            {dados.kitnet_numero}
                          </strong>
                        </div>

                        <div className="detail-line">
                          <span>Início</span>

                          <strong>
                            {formatarData(
                              dados.data_inicio,
                            )}
                          </strong>
                        </div>

                        <div className="detail-line">
                          <span>Fim</span>

                          <strong>
                            {dados.data_fim
                              ? formatarData(
                                  dados.data_fim,
                                )
                              : "Contrato ativo"}
                          </strong>
                        </div>

                        {dados.consumo && (
                          <div className="detail-line">
                            <span>
                              Último consumo
                            </span>

                            <strong>
                              {
                                dados.consumo
                                  .consumo_kwh
                              }{" "}
                              kWh
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

                  <div className="modal-actions">

                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() =>
                        editarInquilino(
                          selecionado,
                        )
                      }
                    >
                      ✏️ Editar dados
                    </button>

                    {dados && ativo && (
                      <button
                        className="btn btn-warning"
                        type="button"
                        onClick={() =>
                          encerrarContrato(
                            dados,
                          )
                        }
                      >
                        🚪 Encerrar contrato
                      </button>
                    )}

                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={() =>
                        excluirInquilino(
                          selecionado,
                        )
                      }
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
