
import Botao from "../components/Botao";
import Loading from "../components/Loading";

import "./EstadoDashboard.css";

// Mostra o carregamento ou o erro ao buscar os dados.
export default function EstadoDashboard({
  carregando,
  erro,
  onTentarNovamente,
}) {
  return (
    <>
      {erro && (
        <div className="dashboard-error">
          <strong>
            Não foi possível carregar os dados.
          </strong>

          <Botao onClick={onTentarNovamente}>
            Tentar novamente
          </Botao>
        </div>
      )}

      {carregando && (
        <div className="dashboard-loading">
          <div className="loading-circle"></div>

          <Loading>
            Carregando seus dados...
          </Loading>
        </div>
      )}
    </>
  );
}

