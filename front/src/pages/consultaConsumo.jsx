import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./consultaConsumo.css";

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

function Consulta() {
  const [consumos, setConsumos] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [inquilinos, setInquilinos] = useState([]);

  const [filtroInquilino, setFiltroInquilino] =
    useState("");

  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAno, setFiltroAno] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  // Busca os dados usados no histórico
  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [
        consumosResponse,
        contratosResponse,
        inquilinosResponse,
      ] = await Promise.all([
        api.get("/api/consumo/listar"),
        api.get("/api/contratos"),
        api.get("/api/inquilinos"),
      ]);

      setConsumos(
        Array.isArray(consumosResponse.data)
          ? consumosResponse.data
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
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível carregar o histórico.",
      );
    } finally {
      setCarregando(false);
    }
  }

  // Encontra o contrato de um consumo
  function buscarContrato(contratoId) {
    return contratos.find(
      (contrato) =>
        Number(contrato.id) ===
        Number(contratoId),
    );
  }

  // Encontra o nome do inquilino
  function buscarInquilino(contratoId) {
    const contrato = buscarContrato(contratoId);

    return inquilinos.find(
      (inquilino) =>
        Number(inquilino.id) ===
        Number(contrato?.inquilino_id),
    );
  }

  // Filtra os registros
  const historico = useMemo(() => {
    return consumos
      .filter((consumo) => {
        // Filtro por inquilino
        if (filtroInquilino) {
          const contrato = buscarContrato(
            consumo.contrato_id,
          );

          if (
            Number(contrato?.inquilino_id) !==
            Number(filtroInquilino)
          ) {
            return false;
          }
        }

        // Filtro por mês
        if (
          filtroMes &&
          Number(consumo.mes) !==
            Number(filtroMes)
        ) {
          return false;
        }

        // Filtro por ano
        if (
          filtroAno &&
          Number(consumo.ano) !==
            Number(filtroAno)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (Number(a.ano) !== Number(b.ano)) {
          return Number(b.ano) - Number(a.ano);
        }

        return Number(b.mes) - Number(a.mes);
      });
  }, [
    consumos,
    contratos,
    filtroInquilino,
    filtroMes,
    filtroAno,
  ]);

  // Soma o consumo mostrado
  const totalKwh = historico.reduce(
    (total, consumo) =>
      total + Number(consumo.consumo_kwh || 0),
    0,
  );

  // Soma o valor da energia mostrada
  const totalEnergia = historico.reduce(
    (total, consumo) =>
      total + Number(consumo.valor_energia || 0),
    0,
  );

  // Cria uma lista dos anos encontrados
  const anos = [
    ...new Set(
      consumos.map((consumo) =>
        Number(consumo.ano),
      ),
    ),
  ].sort((a, b) => b - a);

  return (
    <div className="history-page">

      <main className="history-content">

        {/* Cabeçalho */}
        <header className="history-header">
          <div>
            <span className="history-eyebrow">
              REGISTROS
            </span>

            <h1>Histórico</h1>

            <p>
              Consulte os consumos registrados.
            </p>
          </div>

          <button
            className="history-refresh"
            onClick={carregarDados}
            title="Atualizar"
          >
            ↻
          </button>
        </header>

        {erro && (
          <div className="history-error">
            {erro}
          </div>
        )}

        {carregando ? (
          <div className="history-loading">
            <div className="history-spinner"></div>

            <p>Carregando histórico...</p>
          </div>
        ) : (
          <>
            {/* Filtros */}
            <section className="history-filters">

              <div className="filter-group filter-full">
                <label>Inquilino</label>

                <select
                  value={filtroInquilino}
                  onChange={(e) =>
                    setFiltroInquilino(
                      e.target.value,
                    )
                  }
                >
                  <option value="">
                    Todos os inquilinos
                  </option>

                  {inquilinos.map((inquilino) => (
                    <option
                      key={inquilino.id}
                      value={inquilino.id}
                    >
                      {inquilino.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-row">

                <div className="filter-group">
                  <label>Mês</label>

                  <select
                    value={filtroMes}
                    onChange={(e) =>
                      setFiltroMes(
                        e.target.value,
                      )
                    }
                  >
                    <option value="">
                      Todos
                    </option>

                    {MESES.map(
                      (mes, index) => (
                        <option
                          key={mes}
                          value={index + 1}
                        >
                          {mes}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Ano</label>

                  <select
                    value={filtroAno}
                    onChange={(e) =>
                      setFiltroAno(
                        e.target.value,
                      )
                    }
                  >
                    <option value="">
                      Todos
                    </option>

                    {anos.map((ano) => (
                      <option
                        key={ano}
                        value={ano}
                      >
                        {ano}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

            </section>

            {/* Resumo */}
            <section className="history-summary">

              <div className="history-summary-card">
                <span>Consumo</span>

                <strong>
                  {totalKwh.toFixed(2)} kWh
                </strong>
              </div>

              <div className="history-summary-card">
                <span>Energia</span>

                <strong>
                  {formatarMoeda(
                    totalEnergia,
                  )}
                </strong>
              </div>

            </section>

            {/* Quantidade */}
            <div className="history-result">
              <strong>
                {historico.length}
              </strong>

              <span>
                {historico.length === 1
                  ? " registro encontrado"
                  : " registros encontrados"}
              </span>
            </div>

            {/* Lista */}
            {historico.length === 0 ? (
              <div className="history-empty">

                <div className="empty-icon">
                  📋
                </div>

                <h2>
                  Nenhum registro encontrado
                </h2>

                <p>
                  Tente mudar os filtros ou registre
                  um novo consumo.
                </p>

              </div>
            ) : (
              <section className="history-list">

                {historico.map((consumo) => {
                  const contrato =
                    buscarContrato(
                      consumo.contrato_id,
                    );

                  const inquilino =
                    buscarInquilino(
                      consumo.contrato_id,
                    );

                  return (
                    <article
                      className="history-item"
                      key={consumo.id}
                    >

                      <div className="history-item-top">

                        <div>
                          <span className="history-month">
                            {MESES[
                              Number(
                                consumo.mes,
                              ) - 1
                            ]}{" "}
                            {consumo.ano}
                          </span>

                          <h2>
                            {inquilino?.nome ||
                              "Inquilino não identificado"}
                          </h2>

                          <p>
                            🏠 Kitnet{" "}
                            {contrato?.kitnet_id ||
                              "-"}
                          </p>
                        </div>

                        <div className="history-kwh">
                          <strong>
                            {Number(
                              consumo.consumo_kwh ||
                                0,
                            ).toFixed(2)}
                          </strong>

                          <span>
                            kWh
                          </span>
                        </div>

                      </div>

                      <div className="history-item-bottom">

                        <span>
                          Valor da energia
                        </span>

                        <strong>
                          {formatarMoeda(
                            consumo.valor_energia,
                          )}
                        </strong>

                      </div>

                    </article>
                  );
                })}

              </section>
            )}
          </>
        )}

      </main>

      <Navbar />
    </div>
  );
}

export default Consulta;
