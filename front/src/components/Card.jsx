import "./Card.css";

// Card genérico usado para manter o mesmo padrão visual nas telas.
function Card({ children, className = "" }) {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
}

export default Card;