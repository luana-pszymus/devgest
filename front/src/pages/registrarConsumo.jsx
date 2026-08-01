import { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";

function RegistrarConsumo() {
  const [contratoId, setContratoId] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [leituraAtual, setLeituraAtual] = useState("");
  const [precokwh, setPrecokwh] = useState("0.92");

  const [consumos, setConsumos] = useState([]);

  useEffect(() => {
    carregarConsumos();
  }, []);

  async function carregarConsumos() {
    const { data } = await api.get("/api/consumo/listar");
    setConsumos(data);
  }

  async function registrarConsumo(e) {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3000/api/consumo/registrar",
        {
          contrato_id: Number(contratoId),
          mes: Number(mes),
          ano: Number(ano),
          leitura_atual: Number(leituraAtual),
          preco_kwh: Number(precokwh),
        },
      );

      await carregarConsumos();
      alert(response.data.mensagem);
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.erro || "Erro ao registrar consumo");
    }
  }

  return (
    <div>
      <h1>Registrar Consumo</h1>

      <form onSubmit={registrarConsumo}>
        <div>
          <label>Contrato</label>
          <input
            type="number"
            value={contratoId}
            onChange={(e) => setContratoId(e.target.value)}
          />
        </div>

        <div>
          <label>Mês</label>
          <input
            type="number"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          />
        </div>

        <div>
          <label>Ano</label>
          <input
            type="number"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
          />
        </div>

        <div>
          <label>Leitura Atual</label>
          <input
            type="number"
            value={leituraAtual}
            onChange={(e) => setLeituraAtual(e.target.value)}
          />
        </div>

        <div>
          <label>Preço kWh</label>
          <input
            type="number"
            step="0.01"
            value={precokwh}
            onChange={(e) => setPrecoKwh(e.target.value)}
          />
        </div>

        <button type="submit">Registrar Consumo</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Ano</th>
            <th>Consumo (kwh)</th>
            <th>Energia</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {consumos.map((consumo) => (
            <tr key={consumo.id}>
              <td>{consumo.mes}</td>
              <td>{consumo.ano}</td>
              <td>{consumo.consumo_kwh}</td>
              <td>R$ {consumo.valor_energia}</td>
              <td>R$ {consumo.valor_total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <th>Ações</th>

      <td>
        <button onClick={() => excluirConsumo(consumo.id)}>Excluir</button>
      </td>
    </div>
  );
}

export default RegistrarConsumo;
