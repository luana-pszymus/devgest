import { useEffect, useState } from "react";
import React from "react";

function Inquilinos() {
  const [inquilinos, setInquilinos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/inquilinos")
      .then((res) => res.json())
      .then((data) => {
        setInquilinos(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Inquilinos</h1>

      <ul>
        {inquilinos.map((inquilino) => (
          <li key={inquilino.id}>
            {inquilino.nome} - {inquilino.telefone}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Inquilinos;
