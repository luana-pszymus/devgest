import "./Campo.css";

// Campo padrão para formulários.
// Os campos especiais, como o valor com "R$", continuam sendo feitos diretamente na tela.
function Campo({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  id,
  disabled = false,
  autoFocus = false,
}) {
  return (
    <label className="campo" htmlFor={id}>
      <span>{label}</span>

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
      />
    </label>
  );
}

export default Campo;