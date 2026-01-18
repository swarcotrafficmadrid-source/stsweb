# =============================================================================
# ARCHIVO: correo.py
# VERSIÓN: ticketV2 (Fix Secrets Match)
# FECHA: 17-Ene-2026
# DESCRIPCIÓN: Ajustado para leer la sección [emails] de tu secrets.toml
# =============================================================================
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import streamlit as st
import requests


def _enviar_por_resend(destinatario, asunto, cuerpo):
    emails_cfg = st.secrets.get("emails", {})
    api_key = str(emails_cfg.get("api_key", "")).strip()
    from_email = str(emails_cfg.get("from_email", "")).strip()

    if not api_key or not from_email:
        st.error("Faltan 'api_key' o 'from_email' en [emails] para Resend.")
        return False

    resp = requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "from": from_email,
            "to": [destinatario],
            "subject": asunto,
            "text": cuerpo,
        },
        timeout=20,
    )

    if resp.status_code >= 200 and resp.status_code < 300:
        return True

    st.error(f"Error Resend: {resp.status_code} - {resp.text}")
    return False

def enviar_correo_bienvenida(destinatario, nombre, usuario, password_real):
    try:
        emails_cfg = st.secrets.get("emails", {})
        provider = str(emails_cfg.get("provider", "smtp")).strip().lower()

        # --- CAMBIO CRÍTICO AQUÍ ---
        # Antes buscaba ["smtp"]["email"], ahora busca lo que tú tienes:
        email_real_user = str(st.secrets["emails"]["user"]).strip()
        email_pass = str(st.secrets["emails"]["password"]).strip()

        smtp_server = st.secrets.get("emails", {}).get("smtp_server", "smtp.gmail.com")
        smtp_port = int(st.secrets.get("emails", {}).get("smtp_port", 587))
        use_ssl = bool(st.secrets.get("emails", {}).get("use_ssl", False))

        # Alias (Esto se mantiene igual)
        email_alias = st.secrets.get("emails", {}).get("from_alias", email_real_user)

        # Construir Mensaje
        msg = MIMEMultipart()
        msg['From'] = email_alias 
        msg['To'] = destinatario
        asunto = "Bienvenida - Gestión de Tickets SWARCO Traffic Madrid"
        msg['Subject'] = asunto

        cuerpo = f"""
        Estimado/a {nombre},

        Le damos la bienvenida a la plataforma de gestión SAT de Swarco Traffic Madrid.
        
        Sus credenciales de acceso son:
        ------------------------------------------------
        Usuario:    {usuario}
        Contraseña: {password_real}
        ------------------------------------------------
        
        Por favor, conserve estas credenciales en un lugar seguro.

        Atentamente,
        Soporte Técnico SWARCO
        """
        msg.attach(MIMEText(cuerpo, 'plain'))

        if provider == "resend":
            return _enviar_por_resend(destinatario, asunto, cuerpo)

        # Conexión SMTP
        if use_ssl:
            server = smtplib.SMTP_SSL(smtp_server, smtp_port)
        else:
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.ehlo()
            server.starttls()
            server.ehlo()
        
        # Login con las credenciales reales de secrets.toml
        server.login(email_real_user, email_pass)
        server.send_message(msg)
        server.quit()
        
        return True

    except KeyError as e:
        print(f"❌ ERROR DE LLAVES (SECRETS): No encuentro {e} en secrets.toml")
        st.error(f"Error de configuración: No encuentro la clave {e} en el archivo de secretos.")
        return False
        
    except Exception as e:
        print(f"❌ ERROR SMTP TÉCNICO: {e}")
        st.error(f"Error enviando correo: {e}")
        return False
