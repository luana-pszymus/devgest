import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Preencha o e-mail e a senha.");
      return;
    }

    try {
      setCarregando(true);

      const resposta = await api.post("/api/login", {
        email,
        senha,
      });

      const { token, usuario } = resposta.data;

      if (!token) {
        setErro("O servidor não retornou o token.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      navigate("/dashboard");
    } catch (error) {
      console.error("Erro no login:", error);

      setErro(
        error.response?.data?.erro || "Não foi possível realizar o login.",
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">G</div>
          <span className="login-eyebrow">GESTÃO DE KITNETS</span>
          <h1 className="login-title">GestNet</h1>
          <p className="login-subtitle">Entre para acessar o sistema</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
            />
          </div>

          {erro && <div className="login-error">{erro}</div>}

          <button type="submit" className="login-button" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="login-footer">GestNet • Gestão de Kitnets</div>
      </div>
    </div>
  );
}
