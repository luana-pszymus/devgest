import { useEffect, useState } from "react";
import React from "react";

function Consulta() {
  const [consulta, setConsulta] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/consumo/listar")
      .then((res) => res.json())
      .then((data) => {
        setConsulta(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Registros</h1>

      <ul>
        {consulta.map((consumo) => (
          <li key={consumo.id}>
            {consumo.mes} - {consumo.ano}
            <br></br>
            {consumo.consumo_kwh} - {consumo.valor_energia} <br></br>
            {consumo.valor_aluguel} - {consumo.valor_total}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Consulta;
