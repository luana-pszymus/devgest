import "./Loading.css";

// Mensagem padrão exibida enquanto os dados estão sendo carregados.
function Loading({ children = "Carregando..." }) {
  return (
    <p className="loading">
      {children}
    </p>
  );
}

export default Loading;