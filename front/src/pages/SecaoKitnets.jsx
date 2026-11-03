
import Botao from "../components/Botao";
import Mensagem from "../components/Mensagem";

import KitnetCard from "./KitnetCard";
import "./SecaoKitnets.css";

// Exibe a lista de kitnets ou a mensagem quando ainda não existem imóveis.
export default function SecaoKitnets({
  kitnets,
  encontrarContrato,
  encontrarInquilino,
  encontrarUltimoConsumo,
  onAdicionarKitnet,
}) {
  return (
    <section className="kitnets-section">
      <div className="section-heading">
        <div>
          <span className="section-eyebrow">
            SEUS IMÓVEIS
          </span>

          <h2>Kitnets</h2>
        </div>

        <Botao onClick={onAdicionarKitnet}>
          + Adicionar kitnet
        </Botao>
      </div>

      {kitnets.length === 0 ? (
        <div className="empty-dashboard">
          <div className="empty-icon">⌂</div>

          <h3>Nenhuma kitnet cadastrada</h3>

          <Mensagem>
            Cadastre sua primeira kitnet para começar.
          </Mensagem>

          <Botao onClick={onAdicionarKitnet}>
            + Adicionar kitnet
          </Botao>
        </div>
      ) : (
        <div className="kitnet-list">
          {kitnets.map((kitnet) => {
            const contrato = encontrarContrato(kitnet.id);
            const inquilino = encontrarInquilino(contrato);
            const ultimoConsumo = encontrarUltimoConsumo(
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
  );
}
