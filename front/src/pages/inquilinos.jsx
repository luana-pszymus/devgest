import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./inquilinos.css";

function Inquilinos() {
  const [inquilinos, setInquilinos] = useState([]);
  const [contratos, setContratos] = useState([]);

  const [mostrarForm, setMostrarForm] = useState(false);
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

  // Busca os inquilinos e contratos
  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [inquilinosRes, contratosRes] =
        await Promise.all([
          api.get("/api/inquilinos"),
          api.get("/api/contratos"),
        ]);

      setInquilinos(
        Array.isArray(inquilinosRes.data)
          ? inquilinosRes.data
          : [],
      );

      setContratos(
        Array.isArray(contratosRes.data)
          ? contratosRes.data
          : [],
      );
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível carregar os inquilinos.",
      );
    } finally {
      setCarregando(false);
    }
  }

  // Abre o formulário
  function abrirFormulario() {
    setMostrarForm(true);
    setMensagem("");
    setErro("");
  }

  // Fecha o formulário e limpa os campos
  function fecharFormulario() {
    setMostrarForm(false);
    setNome("");
    setTelefone("");
    setEmail("");
    setErro("");
  }

  // Cadastra um novo inquilino
  async function adicionarInquilino(e) {
    e.preventDefault();

    if (!nome.trim()) {
      setErro("Digite o nome do inquilino.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");
      setMensagem("");

      await api.post("/api/inquilino/", {
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
      });

      setMensagem(
        "Inquilino cadastrado com sucesso!",
      );

      setNome("");
      setTelefone("");
      setEmail("");
      setMostrarForm(false);

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro(
        error.response?.data?.erro ||
          "Não foi possível cadastrar o inquilino.",
      );
    } finally {
      setSalvando(false);
    }
  }

  // Procura a kitnet do inquilino
  function buscarKitnet(inquilinoId) {
    const contrato = contratos.find(
      (item) =>
        Number(item.inquilino_id) ===
        Number(inquilinoId),
    );

    if (!contrato) {
      return null;
    }

    return contrato.kitnet_id;
  }

  return (
    <div className="app-shell">
      <header className="simple-header">
        <div>
          <p className="eyebrow">GESTNET</p>

          <h1>Inquilinos</h1>

          <p>
            Pessoas cadastradas no sistema
          </p>
        </div>

        <button
          className="add-button"
          onClick={abrirFormulario}
          type="button"
        >
          +
        </button>
      </header>

      <main className="page-content">

        {erro && (
          <div className="error-banner">
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="success-banner">
            ✓ {mensagem}
          </div>
        )}

        {/* Formulário de novo inquilino */}
        {mostrarForm && (
          <form
            className="tenant-form"
            onSubmit={adicionarInquilino}
          >
            <div className="form-header">
              <div>
                <h2>Novo inquilino</h2>

                <p>
                  Cadastre os dados da pessoa.
                </p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={fecharFormulario}
              >
                ×
              </button>
            </div>

            <label>
              Nome

              <input
                type="text"
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value)
                }
                placeholder="Nome completo"
                required
              />
            </label>

            <label>
              Telefone

              <input
                type="tel"
                value={telefone}
                onChange={(e) =>
                  setTelefone(e.target.value)
                }
                placeholder="(42) 99999-9999"
              />
            </label>

            <label>
              E-mail

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="email@exemplo.com"
              />
            </label>

            <button
              type="submit"
              className="save-button"
              disabled={salvando}
            >
              {salvando
                ? "Salvando..."
                : "Cadastrar inquilino"}
            </button>
          </form>
        )}

        <div className="tenant-list-header">
          <div>
            <strong>
              {inquilinos.length}
            </strong>

            <span>
              {inquilinos.length === 1
                ? " inquilino cadastrado"
                : " inquilinos cadastrados"}
            </span>
          </div>
        </div>

        {carregando ? (
          <div className="empty-card">
            <span>Carregando...</span>
          </div>
        ) : inquilinos.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon">
              👤
            </div>

            <strong>
              Nenhum inquilino cadastrado
            </strong>

            <span>
              Clique no botão + para adicionar o
              primeiro.
            </span>
          </div>
        ) : (
          <div className="tenant-list">

            {inquilinos.map((inquilino) => {
              const kitnet = buscarKitnet(
                inquilino.id,
              );

              return (
                <article
                  className="tenant-card"
                  key={inquilino.id}
                >
                  <div className="tenant-avatar">
                    👤
                  </div>

                  <div className="tenant-info">
                    <h2>
                      {inquilino.nome}
                    </h2>

                    {kitnet && (
                      <div className="tenant-kitnet">
                        🏠 Kitnet {kitnet}
                      </div>
                    )}

                    {inquilino.telefone ? (
                      <p>
                        📞 {inquilino.telefone}
                      </p>
                    ) : (
                      <p className="muted">
                        Telefone não informado
                      </p>
                    )}

                    {inquilino.email && (
                      <small>
                        {inquilino.email}
                      </small>
                    )}
                  </div>
                </article>
              );
            })}

          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}

export default Inquilinos;
