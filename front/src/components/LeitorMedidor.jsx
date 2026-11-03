import { useEffect, useRef, useState } from "react";
import { createWorker, PSM } from "tesseract.js";
import "./LeitorMedidor.css";

export default function LeitorMedidor({ onFechar, onConfirmar }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [permissao, setPermissao] = useState("aguardando");
  const [arquivo, setArquivo] = useState(null);
  const [imagem, setImagem] = useState("");
  const [leitura, setLeitura] = useState("");
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Para a câmera quando o componente for fechado.
  function pararCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  // Solicita a permissão e abre a câmera.
  async function solicitarPermissao() {
    setErro("");
    setMensagem("");
    setPermissao("solicitando");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Câmera indisponível. Abra o sistema em uma conexão HTTPS.",
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      streamRef.current = stream;

      setPermissao("autorizada");
      setMensagem("Câmera autorizada! Posicione o medidor na área indicada.");
    } catch (error) {
      console.error("Erro ao abrir câmera:", error);

      setPermissao("bloqueada");

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        setErro(
          "O acesso à câmera foi bloqueado. Libere a permissão nas configurações do navegador e tente novamente.",
        );
      } else if (error.name === "NotFoundError") {
        setErro("Nenhuma câmera foi encontrada neste dispositivo.");
      } else {
        setErro(error.message || "Não foi possível abrir a câmera.");
      }

      pararCamera();
    }
  }

  // Conecta a câmera depois que o React renderizar o vídeo.
  useEffect(() => {
    if (permissao !== "autorizada") return;

    const video = videoRef.current;
    const stream = streamRef.current;

    if (!video || !stream) return;

    video.srcObject = stream;

    video.play().catch((error) => {
      console.error("Erro ao iniciar o vídeo:", error);
      setErro(
        "A câmera foi autorizada, mas não foi possível iniciar a imagem.",
      );
      setPermissao("bloqueada");
      pararCamera();
    });
  }, [permissao]);

  // Encerra a câmera e libera a imagem temporária ao fechar.
  useEffect(() => {
    return () => {
      pararCamera();

      if (imagem) {
        URL.revokeObjectURL(imagem);
      }
    };
  }, [imagem]);

  // Fotografa o medidor.
  function tirarFoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !video.videoWidth) {
      setErro("A câmera ainda não está pronta.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const contexto = canvas.getContext("2d");
    contexto.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setErro("Não foi possível capturar a foto.");
          return;
        }

        const novaFoto = new File([blob], "medidor.jpg", {
          type: "image/jpeg",
        });

        const novaImagem = URL.createObjectURL(novaFoto);

        setArquivo(novaFoto);
        setImagem(novaImagem);
        setLeitura("");
        setErro("");
        setMensagem("");

        pararCamera();
      },
      "image/jpeg",
      0.9,
    );
  }

  // Reconhece os números da foto.
  async function reconhecerLeitura() {
    if (!arquivo) {
      setErro("Tire uma foto antes de reconhecer os números.");
      return;
    }

    let worker;

    try {
      setProcessando(true);
      setErro("");
      setMensagem("Lendo os números do medidor...");

      worker = await createWorker("eng");

      await worker.setParameters({
        tessedit_char_whitelist: "0123456789.,",
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
      });

      const resultado = await worker.recognize(arquivo);
      const numeros = resultado.data.text.match(/\d+(?:[.,]\d+)?/g) || [];

      if (numeros.length === 0) {
        setLeitura("");
        setErro("Não consegui reconhecer os números. Digite-os manualmente.");
        setMensagem("");
        return;
      }

      const numeroEncontrado = numeros.sort((a, b) => b.length - a.length)[0];

      setLeitura(numeroEncontrado.replace(",", "."));
      setMensagem("Leitura reconhecida! Confira o número antes de confirmar.");
    } catch (error) {
      console.error("Erro no reconhecimento:", error);
      setErro(
        "Não foi possível ler a foto. Tente novamente ou digite o número.",
      );
      setMensagem("");
    } finally {
      if (worker) await worker.terminate();
      setProcessando(false);
    }
  }

  // Permite tirar outra foto.
  async function tirarOutraFoto() {
    if (imagem) URL.revokeObjectURL(imagem);

    setImagem("");
    setArquivo(null);
    setLeitura("");
    setErro("");
    setMensagem("");

    await solicitarPermissao();
  }

  // Envia a foto e a leitura para o formulário.
  function confirmar() {
    if (!arquivo) {
      setErro("Tire uma foto do medidor.");
      return;
    }

    if (leitura.trim() === "" || !Number.isFinite(Number(leitura))) {
      setErro("Confira e digite uma leitura válida.");
      return;
    }

    onConfirmar({
      arquivo,
      leitura: leitura.trim(),
    });
  }

  return (
    <div className="leitor-fundo">
      <section className="leitor-modal">
        <header className="leitor-cabecalho">
          <div>
            <span>LEITURA DE ENERGIA</span>
            <h2>Fotografar medidor</h2>
          </div>

          <button type="button" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </header>

        <p className="leitor-instrucao">
          Vamos utilizar a câmera para fotografar o medidor e reconhecer os
          números da leitura.
        </p>

        <div className="leitor-camera">
          {imagem ? (
            <img src={imagem} alt="Foto do medidor" />
          ) : permissao === "autorizada" ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted />
              <div className="leitor-guia" />
            </>
          ) : (
            <div className="leitor-permissao">
              <span>📷</span>
              <p>Precisamos da sua autorização para acessar a câmera.</p>

              <button
                type="button"
                className="leitor-principal"
                onClick={solicitarPermissao}
                disabled={permissao === "solicitando"}
              >
                {permissao === "solicitando"
                  ? "Solicitando permissão..."
                  : "Permitir acesso à câmera"}
              </button>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} hidden />

        {erro && <p className="leitor-erro">{erro}</p>}
        {mensagem && <p className="leitor-mensagem">{mensagem}</p>}

        {permissao === "bloqueada" && (
          <p className="leitor-instrucao">
            Se você já bloqueou o acesso, clique no ícone de configurações ou
            cadeado ao lado do endereço do site, permita o uso da câmera e tente
            novamente.
          </p>
        )}

        {arquivo && (
          <div className="leitor-resultado">
            <label htmlFor="leitura-reconhecida">
              Leitura reconhecida — confira ou corrija
            </label>

            <input
              id="leitura-reconhecida"
              type="text"
              inputMode="decimal"
              value={leitura}
              onChange={(e) => setLeitura(e.target.value)}
              placeholder="Ex.: 1234.5"
            />
          </div>
        )}

        <div className="leitor-acoes">
          {!imagem && permissao === "autorizada" && (
            <button
              type="button"
              className="leitor-principal"
              onClick={tirarFoto}
            >
              📷 Tirar foto
            </button>
          )}

          {imagem && (
            <>
              <button
                type="button"
                className="leitor-secundario"
                onClick={tirarOutraFoto}
                disabled={processando}
              >
                Tirar outra foto
              </button>

              <button
                type="button"
                className="leitor-secundario"
                onClick={reconhecerLeitura}
                disabled={processando}
              >
                {processando ? "Lendo..." : "Reconhecer números"}
              </button>

              <button
                type="button"
                className="leitor-principal"
                onClick={confirmar}
                disabled={!leitura.trim() || processando}
              >
                Confirmar leitura
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
