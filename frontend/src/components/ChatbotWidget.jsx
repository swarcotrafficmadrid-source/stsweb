import { useState, useEffect, useRef } from "react";
import { apiRequest } from "../lib/api.js";

export default function ChatbotWidget({ token, lang = "es" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const messagesEndRef = useRef(null);
  
  const MESSAGE_COOLDOWN = 1000; // 1 segundo entre mensajes

  const copy = {
    es: {
      title: "Asistente Virtual",
      placeholder: "Escribe tu pregunta...",
      send: "Enviar",
      typing: "Escribiendo...",
      welcome: "¡Hola! ¿En qué puedo ayudarte hoy?",
      faq: "Preguntas Frecuentes",
      close: "Cerrar"
    },
    en: {
      title: "Virtual Assistant",
      placeholder: "Type your question...",
      send: "Send",
      typing: "Typing...",
      welcome: "Hello! How can I help you today?",
      faq: "Frequently Asked Questions",
      close: "Close"
    }
  };

  const t = copy[lang] || copy.es;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: t.welcome,
          sender: "bot",
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleSend(e) {
    e?.preventDefault();
    
    if (!inputMessage.trim() || loading) return;
    
    // Rate limiting del lado del cliente
    const now = Date.now();
    if (now - lastMessageTime < MESSAGE_COOLDOWN) {
      return; // Ignorar mensaje muy rápido (spam)
    }
    setLastMessageTime(now);

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await apiRequest("/api/chatbot/ask", "POST", {
        message: inputMessage,
        lang
      }, token);

      const botMessage = {
        id: Date.now() + 1,
        text: response.response,
        sender: "bot",
        timestamp: new Date(),
        category: response.category
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Lo siento, hubo un error. Por favor, intenta de nuevo.",
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickQuestion(question) {
    setInputMessage(question);
    setTimeout(() => handleSend(), 100);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-swarcoBlue text-white rounded-full shadow-lg hover:bg-swarcoBlue/90 flex items-center justify-center z-50 transition-transform hover:scale-110"
        title={t.title}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200">
      {/* Header */}
      <div className="bg-swarcoBlue text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">{t.title}</h3>
            <p className="text-xs text-white/80">SWARCO Traffic Spain</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.sender === "user"
                  ? "bg-swarcoBlue text-white"
                  : "bg-white text-slate-900 border border-slate-200"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-xs mt-1 ${
                msg.sender === "user" ? "text-white/70" : "text-slate-400"
              }`}>
                {msg.timestamp.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-swarcoBlue rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-swarcoBlue rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-swarcoBlue rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <span className="text-xs text-slate-500 ml-2">{t.typing}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="p-3 border-t border-slate-200 bg-white">
          <p className="text-xs text-slate-500 mb-2">{t.faq}:</p>
          <div className="space-y-2">
            {[
              "¿Cómo creo un ticket?",
              "¿Puedo subir fotos?",
              "¿Cuál es el estado de mi ticket?"
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                className="w-full text-left text-xs p-2 border border-slate-200 rounded hover:bg-slate-50 text-slate-700"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-swarcoBlue"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-4 py-2 bg-swarcoBlue text-white rounded-lg hover:bg-swarcoBlue/90 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
