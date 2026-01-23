import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * Base de conocimiento del chatbot
 * En producción esto estaría en una BD o servicio de IA
 */
const knowledgeBase = {
  es: [
    {
      keywords: ["hola", "buenos dias", "buenas tardes", "hey"],
      response: "¡Hola! Soy el asistente virtual de SWARCO Traffic Spain. ¿En qué puedo ayudarte hoy?",
      category: "greeting"
    },
    {
      keywords: ["crear ticket", "nuevo ticket", "reportar falla", "incidencia"],
      response: "Para crear un ticket, ve al menú principal y selecciona el tipo de solicitud:\n• Incidencias - Para reportar fallos\n• Repuestos - Para solicitar piezas\n• Compras - Para adquisiciones\n• Asistencia - Para soporte técnico",
      category: "tickets"
    },
    {
      keywords: ["estado", "seguimiento", "mi ticket", "ticket"],
      response: "Puedes ver el estado de tus tickets en el Dashboard. Cada ticket muestra su estado actual: Pendiente, En Progreso, o Resuelto.",
      category: "status"
    },
    {
      keywords: ["foto", "imagen", "subir foto", "adjuntar"],
      response: "Puedes adjuntar hasta 10 fotos por ticket. Las fotos se comprimen automáticamente para ahorrar espacio. También puedes subir videos de hasta 50MB.",
      category: "files"
    },
    {
      keywords: ["urgente", "prioridad", "critico", "emergencia"],
      response: "Para tickets urgentes, selecciona prioridad 'Alta' al crear la incidencia. El equipo SAT recibirá una notificación inmediata.",
      category: "priority"
    },
    {
      keywords: ["repuesto", "pieza", "spare"],
      response: "Para solicitar repuestos, crea un ticket de tipo 'Repuestos'. Incluye el serial del equipo, la referencia, y fotos si es posible.",
      category: "spares"
    },
    {
      keywords: ["compra", "cotizar", "precio", "purchase"],
      response: "Para solicitudes de compra, crea un ticket de tipo 'Compras'. Especifica el proyecto, país, y los equipos que necesitas.",
      category: "purchase"
    },
    {
      keywords: ["asistencia", "visita", "tecnico", "assistance"],
      response: "Para solicitar asistencia técnica, crea un ticket de 'Asistencia'. Incluye la fecha, hora, lugar y descripción de la falla.",
      category: "assistance"
    },
    {
      keywords: ["usuario", "cuenta", "password", "contrasena", "olvidé"],
      response: "Para recuperar tu contraseña, usa la opción '¿Olvidaste tu contraseña?' en la pantalla de login. Recibirás un email con instrucciones.",
      category: "account"
    },
    {
      keywords: ["contacto", "email", "telefono", "llamar"],
      response: "Puedes contactarnos en:\n• Email: sfr.support@swarco.com\n• Teléfono: +34 91 XXX XXXX\n• Horario: Lun-Vie 9:00-18:00",
      category: "contact"
    },
    {
      keywords: ["horario", "cuando", "hora"],
      response: "Nuestro horario de atención es:\nLunes a Viernes: 9:00 - 18:00\nSábados, Domingos y festivos: Cerrado\n\nPara emergencias 24/7, marca el teléfono de guardia.",
      category: "schedule"
    },
    {
      keywords: ["gracias", "perfecto", "ok", "vale"],
      response: "¡De nada! Si necesitas algo más, estoy aquí para ayudarte. 😊",
      category: "thanks"
    }
  ],
  en: [
    {
      keywords: ["hello", "hi", "hey", "good morning"],
      response: "Hello! I'm the SWARCO Traffic Spain virtual assistant. How can I help you today?",
      category: "greeting"
    },
    {
      keywords: ["create ticket", "new ticket", "report", "issue"],
      response: "To create a ticket, go to the main menu and select the type of request:\n• Failures - To report issues\n• Spares - To request parts\n• Purchases - For acquisitions\n• Assistance - For technical support",
      category: "tickets"
    },
    {
      keywords: ["status", "tracking", "my ticket"],
      response: "You can see the status of your tickets in the Dashboard. Each ticket shows its current status: Pending, In Progress, or Resolved.",
      category: "status"
    },
    {
      keywords: ["photo", "image", "upload", "attach"],
      response: "You can attach up to 10 photos per ticket. Photos are automatically compressed to save space. You can also upload videos up to 50MB.",
      category: "files"
    },
    {
      keywords: ["urgent", "priority", "critical", "emergency"],
      response: "For urgent tickets, select 'High' priority when creating the incident. The SAT team will receive an immediate notification.",
      category: "priority"
    }
  ]
};

/**
 * Endpoint de chatbot
 * Busca en la base de conocimiento y retorna respuesta
 */
router.post("/ask", requireAuth, async (req, res) => {
  try {
    const { message, lang = "es" } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Mensaje requerido" });
    }

    const messageLower = message.toLowerCase().trim();
    const kb = knowledgeBase[lang] || knowledgeBase.es;

    // Buscar respuesta que coincida
    let bestMatch = null;
    let maxMatches = 0;

    for (const entry of kb) {
      const matches = entry.keywords.filter(keyword => 
        messageLower.includes(keyword)
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = entry;
      }
    }

    // Si encontró match
    if (bestMatch && maxMatches > 0) {
      return res.json({
        response: bestMatch.response,
        category: bestMatch.category,
        confidence: maxMatches / bestMatch.keywords.length
      });
    }

    // Respuesta por defecto si no encontró match
    const defaultResponse = lang === "en"
      ? "I'm sorry, I didn't understand your question. You can:\n• Create a new ticket\n• Check your tickets in Dashboard\n• Contact us at sfr.support@swarco.com"
      : "Lo siento, no entendí tu pregunta. Puedes:\n• Crear un nuevo ticket\n• Ver tus tickets en el Dashboard\n• Contactarnos en sfr.support@swarco.com";

    res.json({
      response: defaultResponse,
      category: "default",
      confidence: 0
    });

  } catch (error) {
    console.error("Error en chatbot:", error);
    res.status(500).json({ error: "Error al procesar mensaje" });
  }
});

/**
 * Obtener preguntas frecuentes
 */
router.get("/faq", requireAuth, async (req, res) => {
  try {
    const { lang = "es" } = req.query;

    const faqs = {
      es: [
        {
          question: "¿Cómo creo un ticket?",
          answer: "Ve al menú principal y selecciona el tipo de solicitud que necesitas."
        },
        {
          question: "¿Puedo subir fotos?",
          answer: "Sí, puedes adjuntar hasta 10 fotos por ticket."
        },
        {
          question: "¿Cuánto tarda la respuesta?",
          answer: "El tiempo de respuesta depende de la prioridad. Tickets urgentes: 2-4 horas. Normales: 1-2 días."
        },
        {
          question: "¿Cómo veo mis tickets?",
          answer: "En el Dashboard puedes ver todos tus tickets y su estado actual."
        },
        {
          question: "¿Puedo agregar comentarios?",
          answer: "Sí, puedes comentar en cualquier ticket desde su timeline."
        }
      ],
      en: [
        {
          question: "How do I create a ticket?",
          answer: "Go to the main menu and select the type of request you need."
        },
        {
          question: "Can I upload photos?",
          answer: "Yes, you can attach up to 10 photos per ticket."
        },
        {
          question: "How long does it take?",
          answer: "Response time depends on priority. Urgent: 2-4 hours. Normal: 1-2 days."
        },
        {
          question: "How do I see my tickets?",
          answer: "In the Dashboard you can see all your tickets and their current status."
        },
        {
          question: "Can I add comments?",
          answer: "Yes, you can comment on any ticket from its timeline."
        }
      ]
    };

    res.json({
      lang,
      faqs: faqs[lang] || faqs.es
    });

  } catch (error) {
    console.error("Error obteniendo FAQs:", error);
    res.status(500).json({ error: "Error al obtener FAQs" });
  }
});

export default router;
