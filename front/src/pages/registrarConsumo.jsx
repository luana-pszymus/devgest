import { useEffect, useState } from "react";
import api from "../services/api";

function RegistrarConsumo() {
  const [contratos, setContratos] = useState([]);
  const [consumos, setConsumos] = useState([]);

  const [contratoId, setContratoId] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState(new Date().getFullYear());
  const [leituraAtual, setLeituraAtual] = useState("");
  const [precoKwh, setPrecoKwh] = useState("0.92");

  const [leituraAnterior, setLeituraAnterior] = useState(null);

  useEffect(() => {
    carregarContratos();
    carregarConsumos();
  }, []);

  async function carregarContratos() {
    try {
      const { data } = await api.get("/api/contratos");

      setContratos(data);
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
    }
  }

  async function carregarConsumos() {
    try {
      const { data } = await api.get("/api/consumo/listar");

      setConsumos(data);
    } catch (error) {
      console.error("Erro ao carregar consumos:", error);
    }
  }

  async function selecionarContrato(id) {
    setContratoId(id);

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

    try {
      const response = await api.post("/api/consumo/registrar", {
        contrato_id: Number(contratoId),
        mes: Number(mes),
        ano: Number(ano),
        leitura_atual: Number(leituraAtual),
        preco_kwh: Number(precoKwh),
      });

      await carregarConsumos();

      alert(response.data.mensagem);

      setLeituraAtual("");
      setMes("");

      // Atualiza a leitura anterior para a recém cadastrada
      setLeituraAnterior(Number(leituraAtual));
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.erro || "Erro ao registrar consumo");
    }
  }

  return (
    <div>
      <h1>Registrar Consumo</h1>

      <form onSubmit={registrarConsumo}>
        {/* CONTRATO */}
        <div>
          <label>Contrato</label>

          <select
            value={contratoId}
            onChange={(e) => selecionarContrato(e.target.value)}
            required
          >
            <option value="">Selecione um contrato</option>

            {contratos.map((contrato) => (
              <option key={contrato.id} value={contrato.id}>
                Contrato #{contrato.id}
              </option>
            ))}
          </select>
        </div>

        {/* INFORMAÇÕES DO CONTRATO */}
        {contratoId && (
          <div>
            <p>
              <strong>Kitnet:</strong>{" "}
              {
                contratos.find((contrato) => contrato.id === Number(contratoId))
                  ?.kitnet_id
              }
            </p>

            <p>
              <strong>Inquilino:</strong>{" "}
              {
                contratos.find((contrato) => contrato.id === Number(contratoId))
                  ?.inquilino_id
              }
            </p>
          </div>
        )}

        {/* MÊS */}
        <div>
          <label>Mês</label>

          <select value={mes} onChange={(e) => setMes(e.target.value)} required>
            <option value="">Selecione o mês</option>
            <option value="1">Janeiro</option>
            <option value="2">Fevereiro</option>
            <option value="3">Março</option>
            <option value="4">Abril</option>
            <option value="5">Maio</option>
            <option value="6">Junho</option>
            <option value="7">Julho</option>
            <option value="8">Agosto</option>
            <option value="9">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>
        </div>

        {/* ANO */}
        <div>
          <label>Ano</label>

          <input
            type="number"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            required
          />
        </div>

        {/* LEITURA ANTERIOR */}
        <div>
          <label>Leitura anterior</label>

          <input type="number" value={leituraAnterior ?? ""} disabled />
        </div>

        {/* LEITURA ATUAL */}
        <div>
          <label>Leitura atual</label>

          <input
            type="number"
            value={leituraAtual}
            onChange={(e) => setLeituraAtual(e.target.value)}
            required
          />
        </div>

        {/* PREÇO KWH */}
        <div>
          <label>Preço do kWh</label>

          <input
            type="number"
            step="0.01"
            value={precoKwh}
            onChange={(e) => setPrecoKwh(e.target.value)}
            required
          />
        </div>

        <button type="submit">Registrar Consumo</button>
      </form>

      <hr />

      <h2>Histórico de Consumos</h2>

      <table>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Ano</th>
            <th>Consumo (kWh)</th>
            <th>Energia</th>
            <th>Total</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {consumos.map((consumo) => (
            <tr key={consumo.id}>
              <td>{consumo.mes}</td>

              <td>{consumo.ano}</td>

              <td>{consumo.consumo_kwh} kWh</td>

              <td>R$ {Number(consumo.valor_energia).toFixed(2)}</td>

              <td>R$ {Number(consumo.valor_total).toFixed(2)}</td>

              <td>
                <button onClick={() => excluirConsumo(consumo.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RegistrarConsumo;
