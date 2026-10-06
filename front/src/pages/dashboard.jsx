import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Botao from "../components/Botao";
import Card from "../components/Card";
import Loading from "../components/Loading";
import Mensagem from "../components/Mensagem";

import KitnetCard from "./KitnetCard";
import FormularioKitnet from "./FormularioKitnet";

import api from "../services/api";
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

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [salvandoKitnet, setSalvandoKitnet] =
    useState(false);

  const [numeroKitnet, setNumeroKitnet] = useState("");
  const [valorAluguel, setValorAluguel] = useState("");

  const [mensagemKitnet, setMensagemKitnet] = useState("");
  const [erroKitnet, setErroKitnet] = useState("");

  const navigate = useNavigate();

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

      setKitnets(
        Array.isArray(kitnetsResponse.data)
          ? kitnetsResponse.data
          : [],
      );

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
      (inquilino) =>
        Number(inquilino.id) ===
        Number(contrato.inquilino_id),
    );
  }

  function encontrarUltimoConsumo(contratoId) {
    const registros = consumos
      .filter(
        (consumo) =>
          Number(consumo.contrato_id) ===
          Number(contratoId),
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
      setErroKitnet(
        "Informe um valor de aluguel válido.",
      );
      return;
    }

    const numeroJaExiste = kitnets.some(
      (kitnet) =>
        String(kitnet.numero)
          .trim()
          .toLowerCase() === numero.toLowerCase(),
    );

    if (numeroJaExiste) {
      setErroKitnet(
        "Já existe uma kitnet com esse número.",
      );
      return;
    }

    try {
      setSalvandoKitnet(true);

      await api.post("/api/kitnet", {
        numero,
        valor_aluguel: valor,
      });

      setMensagemKitnet(
        "Kitnet cadastrada com sucesso.",
      );

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

  function handleLogout() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");

    navigate("/login");
  }

  const totalKitnets = kitnets.length;

  const kitnetsOcupadas = kitnets.filter((kitnet) =>
    encontrarContrato(kitnet.id),
  ).length;

  const kitnetsDisponiveis =
    totalKitnets - kitnetsOcupadas;

  const valorAlugueis = kitnets
    .filter((kitnet) => encontrarContrato(kitnet.id))
    .reduce(
      (total, kitnet) =>
        total + Number(kitnet.valor_aluguel || 0),
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
    (total, consumo) =>
      total + Number(consumo.valor_energia || 0),
    0,
  );

  return (
    <div className="dashboard">
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              GESTÃO DE KITNETS
            </span>

            <h1>Visão geral</h1>

            <p>
              {MESES[mesAtual - 1]} de {anoAtual}
            </p>
          </div>

          <div className="dashboard-header-actions">
            <Botao
              onClick={carregarDados}
              title="Atualizar dados"
              aria-label="Atualizar dados"
            >
              ↻
            </Botao>

            <Botao
              tipo="cancelar"
              onClick={handleLogout}
            >
              Sair
            </Botao>
          </div>
        </header>

        {erro && (
          <div className="dashboard-error">
            <strong>
              Não foi possível carregar os dados.
            </strong>

            <Botao onClick={carregarDados}>
              Tentar novamente
            </Botao>
          </div>
        )}

        {carregando ? (
          <div className="dashboard-loading">
            <div className="loading-circle"></div>

            <Loading>
              Carregando seus dados...
            </Loading>
          </div>
        ) : (
          <>
            <section className="summary-section">
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

            <section className="kitnets-section">
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">
                    SEUS IMÓVEIS
                  </span>

                  <h2>Kitnets</h2>
                </div>

                <Botao onClick={abrirFormularioKitnet}>
                  + Adicionar kitnet
                </Botao>
              </div>

              {kitnets.length === 0 ? (
                <div className="empty-dashboard">
                  <div className="empty-icon">⌂</div>

                  <h3>
                    Nenhuma kitnet cadastrada
                  </h3>

                  <Mensagem>
                    Cadastre sua primeira kitnet para
                    começar.
                  </Mensagem>

                  <Botao
                    onClick={abrirFormularioKitnet}
                  >
                    + Adicionar kitnet
                  </Botao>
                </div>
              ) : (
                <div className="kitnet-list">
                  {kitnets.map((kitnet) => {
                    const contrato =
                      encontrarContrato(kitnet.id);

                    const inquilino =
                      encontrarInquilino(contrato);

                    const ultimoConsumo =
                      encontrarUltimoConsumo(
                        contrato?.id,
                      );

                    return (
                      <KitnetCard
                        key={kitnet.id}
                        kitnet={kitnet}
                        contrato={contrato}
                        inquilino={inquilino}
                        ultimoConsumo={ultimoConsumo}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <FormularioKitnet
        aberto={mostrarFormulario}
        onFechar={fecharFormularioKitnet}
        onSubmit={cadastrarKitnet}
        numero={numeroKitnet}
        setNumero={setNumeroKitnet}
        valor={valorAluguel}
        setValor={setValorAluguel}
        erro={erroKitnet}
        mensagem={mensagemKitnet}
        salvando={salvandoKitnet}
      />

      <Navbar />
    </div>
  );
}
