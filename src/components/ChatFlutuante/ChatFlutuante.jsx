import { useEffect, useRef, useState } from "react";
import { enviarMensagem } from "../../services/dados";
import "./ChatFlutuante.css";

const LIMITE_CARACTERES = 500;

const BOAS_VINDAS = {
  id: 0,
  autor: "ia",
  texto: "Demonstração com respostas pré-programadas. Não consulto os dados da empresa nem um serviço de IA.",
};

/**
 * Chat flutuante com a IA — Histórias 8.1 e 8.3.
 * Botão fixo no canto da tela; ao clicar abre o painel com balões de mensagem,
 * indicador de "digitando" enquanto a IA responde e tratamento de erro.
 */
export default function ChatFlutuante() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState([BOAS_VINDAS]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const fimRef = useRef(null);

  // Sempre mostra a mensagem mais recente.
  useEffect(() => {
    fimRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [mensagens, carregando, aberto]);

  async function enviar(event) {
    event.preventDefault();
    const pergunta = texto.trim();
    if (!pergunta || carregando) return;

    setErro("");
    setTexto("");
    setMensagens((lista) => [...lista, { id: Date.now(), autor: "usuario", texto: pergunta }]);
    setCarregando(true);

    try {
      const resposta = await enviarMensagem(pergunta);
      if (!resposta) throw new Error("A IA não devolveu resposta.");
      setMensagens((lista) => [...lista, { id: Date.now() + 1, autor: "ia", texto: resposta }]);
    } catch (err) {
      setErro(err.message || "Não foi possível obter a resposta. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  // Enter envia; Shift+Enter quebra a linha.
  function aoApertarTecla(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar(e);
    }
  }

  return (
    <div className="chat-raiz">
      {aberto && (
        <section className="chat-painel" aria-label="Chat com a IA">
          <header className="chat-topo">
            <span>Assistente Regulariza — demonstração</span>
            <button
              type="button"
              className="chat-fechar"
              aria-label="Fechar chat"
              onClick={() => setAberto(false)}
            >
              ×
            </button>
          </header>

          <div className="chat-mensagens" aria-live="polite">
            {mensagens.map((m) => (
              <div key={m.id} className={`chat-balao ${m.autor}`}>
                {m.texto}
              </div>
            ))}
            {carregando && (
              <div className="chat-balao ia chat-digitando" aria-label="A IA está respondendo">
                <span />
                <span />
                <span />
              </div>
            )}
            {erro && <div className="chat-erro">{erro}</div>}
            <div ref={fimRef} />
          </div>

          <form className="chat-form" onSubmit={enviar}>
            <textarea
              rows={1}
              placeholder="Digite sua dúvida..."
              maxLength={LIMITE_CARACTERES}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={aoApertarTecla}
              disabled={carregando}
              aria-label="Mensagem"
            />
            <button type="submit" disabled={carregando || !texto.trim()}>
              Enviar
            </button>
          </form>
          <p className="chat-aviso">
            Respostas simuladas, sem conexão com IA. Confirme prazos com o órgão responsável.
          </p>
        </section>
      )}

      <button
        type="button"
        className="chat-botao"
        aria-label={aberto ? "Fechar chat" : "Abrir chat com a IA"}
        aria-expanded={aberto}
        onClick={() => setAberto((valor) => !valor)}
      >
        {aberto ? "×" : "💬"}
      </button>
    </div>
  );
}