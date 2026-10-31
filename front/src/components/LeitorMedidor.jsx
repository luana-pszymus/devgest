
import { useEffect, useRef, useState } from "react";
import { createWorker, PSM } from "tesseract.js";
import "./LeitorMedidor.css";

export default function LeitorMedidor({ onFechar, onConfirmar }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [arquivo, setArquivo] = useState(null);
  const [imagem, setImagem] = useState("");
  const [leitura, setLeitura] = useState("");
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Abre a câmera traseira do celular.
  useEffect(() => {
    let ativo = true;

    async function iniciarCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Câmera não disponível neste navegador.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
          },
          audio: false,
        });

        if (!ativo) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      } catch (error) {
        console.error("Erro ao abrir câmera:", error);
        setErro("Não foi possível abrir a câmera. Verifique a permissão do navegador.");
      }
    }

    iniciarCamera();

    return () => {
      ativo = false;

      streamRef.current?.getTracks().forEach((track) => track.stop());

      if (imagem) {
        URL.revokeObjectURL(imagem);
      }
    };
  }, []);

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

        if (imagem) URL.revokeObjectURL(imagem);

        setArquivo(novaFoto);
        setImagem(URL.createObjectURL(novaFoto));
        setLeitura("");
        setErro("");
        setMensagem("");
      },
      "image/jpeg",
      0.9
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

      const numeros =
        resultado.data.text.match(/\d+(?:[.,]\d+)?/g) || [];

      if (numeros.length === 0) {
        setLeitura("");
        setErro("Não consegui reconhecer os números. Você pode digitá-los manualmente.");
        setMensagem("");
        return;
      }

      const numeroEncontrado = numeros.sort(
        (a, b) => b.length - a.length
      )[0];

      setLeitura(numeroEncontrado.replace(",", "."));
      setMensagem("Leitura reconhecida! Confira o número antes de confirmar.");
    } catch (error) {
      console.error("Erro no reconhecimento:", error);
      setErro("Não foi possível ler a foto. Tente novamente ou digite o número.");
      setMensagem("");
    } finally {
      if (worker) await worker.terminate();

      setProcessando(false);
    }
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
          Posicione os números do medidor dentro da área indicada.
          Evite reflexos e mantenha o celular firme.
        </p>

        <div className="leitor-camera">
          {imagem ? (
            <img src={imagem} alt="Foto do medidor" />
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted />
              <div className="leitor-guia" />
            </>
          )}
        </div>

        <canvas ref={canvasRef} hidden />

        {erro && <p className="leitor-erro">{erro}</p>}
        {mensagem && <p className="leitor-mensagem">{mensagem}</p>}

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
          {!imagem ? (
            <button
              type="button"
              className="leitor-principal"
              onClick={tirarFoto}
            >
              📷 Tirar foto
            </button>
          ) : (
            <>
              <button
                type="button"
                className="leitor-secundario"
                onClick={() => {
                  URL.revokeObjectURL(imagem);
                  setImagem("");
                  setArquivo(null);
                  setLeitura("");
                  setMensagem("");
                  setErro("");
                }}
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
