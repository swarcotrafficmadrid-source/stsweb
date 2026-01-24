import crypto from "crypto";

/**
 * Sistema de Webhooks para notificaciones externas
 * Dispara eventos a URLs configuradas cuando ocurren cambios
 */

/**
 * Trigger a webhook for a specific event
 * @param {string} eventType - Tipo de evento (ej: "ticket.created")
 * @param {object} payload - Datos del evento
 * @param {object} models - Modelos de Sequelize
 */
export async function triggerWebhook(eventType, payload, models) {
  try {
    const { Webhook } = models;
    
    // Buscar webhooks activos que escuchen este evento
    const webhooks = await Webhook.findAll({
      where: {
        active: true
      }
    });

    const relevantWebhooks = webhooks.filter(wh => 
      wh.events.includes(eventType) || wh.events.includes("*")
    );

    if (relevantWebhooks.length === 0) {
      return;
    }

    // Disparar todos los webhooks en paralelo
    const promises = relevantWebhooks.map(webhook => sendWebhook(webhook, eventType, payload));
    await Promise.allSettled(promises);

  } catch (error) {
    console.error("Error al disparar webhooks:", error);
  }
}

/**
 * Send webhook HTTP request
 */
async function sendWebhook(webhook, eventType, payload) {
  try {
    const webhookPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data: payload
    };

    // Generar firma HMAC si hay secret
    const headers = {
      "Content-Type": "application/json",
      "User-Agent": "SWARCO-SAT-Webhooks/1.0"
    };

    if (webhook.secret) {
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(JSON.stringify(webhookPayload))
        .digest("hex");
      headers["X-Webhook-Signature"] = signature;
    }

    const response = await fetch(webhook.url, {
      method: "POST",
      headers,
      body: JSON.stringify(webhookPayload),
      timeout: 10000 // 10 segundos
    });

    if (response.ok) {
      // Éxito
      await webhook.update({
        lastTriggeredAt: new Date(),
        failureCount: 0
      });
      console.log(`[OK] Webhook disparado: ${webhook.name} - ${eventType}`);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

  } catch (error) {
    // Error al enviar webhook
    console.error(`[ERROR] Error webhook ${webhook.name}:`, error.message);
    
    const newFailureCount = webhook.failureCount + 1;
    await webhook.update({
      failureCount: newFailureCount,
      // Desactivar después de 10 fallos consecutivos
      active: newFailureCount < 10
    });
  }
}

/**
 * Eventos disponibles
 */
export const WEBHOOK_EVENTS = {
  TICKET_CREATED: "ticket.created",
  TICKET_UPDATED: "ticket.updated",
  TICKET_STATUS_CHANGED: "ticket.statusChanged",
  COMMENT_ADDED: "comment.added",
  FILE_UPLOADED: "file.uploaded",
  ALL: "*"
};

/**
 * Helper para disparar evento de ticket creado
 */
export async function webhookTicketCreated(ticket, models) {
  await triggerWebhook(WEBHOOK_EVENTS.TICKET_CREATED, {
    ticketId: ticket.id,
    ticketType: ticket.type || "unknown",
    ticketNumber: ticket.requestNumber || `${ticket.type}-${ticket.id}`,
    userId: ticket.userId,
    createdAt: ticket.createdAt
  }, models);
}

/**
 * Helper para disparar evento de cambio de estado
 */
export async function webhookStatusChanged(ticketId, ticketType, oldStatus, newStatus, models) {
  await triggerWebhook(WEBHOOK_EVENTS.TICKET_STATUS_CHANGED, {
    ticketId,
    ticketType,
    oldStatus,
    newStatus,
    changedAt: new Date().toISOString()
  }, models);
}

/**
 * Helper para disparar evento de comentario
 */
export async function webhookCommentAdded(comment, ticket, models) {
  await triggerWebhook(WEBHOOK_EVENTS.COMMENT_ADDED, {
    commentId: comment.id,
    ticketId: ticket.id,
    ticketType: ticket.type,
    userId: comment.userId,
    isInternal: comment.isInternal,
    createdAt: comment.createdAt
  }, models);
}
