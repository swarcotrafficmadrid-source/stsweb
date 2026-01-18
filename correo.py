# =============================================================================
# ARCHIVO: correo.py
# VERSIÓN: ticketV2 (Optimizado para Relay SMTP Swarco)
# FECHA: 18-Ene-2026
# =============================================================================
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import streamlit as st

def enviar_correo_bienvenida(destinatario, nombre, usuario, password_real):
    try:
        # Extraemos credenciales (Asegúrate de que en secrets estén sin espacios)
        email_real_user = str(st.secrets["emails"]["user"]).strip()
        email_pass = str(st.secrets["emails"]["password"]).strip()

        # Configuración del servidor
        smtp_server = st.secrets.get("emails", {}).get("smtp_server", "smtp.gmail.com")
        smtp_port = int(st.secrets.get("emails", {}).get("smtp_port", 587))
        use_ssl = bool(st.secrets.get("emails", {}).get("use_ssl", False))
        smtp_auth = bool(st.secrets.get("emails", {}).get("smtp_auth", True))

        email_alias = st.secrets.get("emails", {}).get("from_alias", email_real_user)

        # Construir Mensaje
        msg = MIMEMultipart()
        msg['From'] = email_alias 
        msg['To'] = destinatario
        msg['Subject'] = "Bienvenida - Gestión de Tickets SWARCO Traffic Madrid"

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

        # Conexión SMTP Segura
        if use_ssl and smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=10)
        else:
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
            server.ehlo()
            # Solo intenta STARTTLS si el servidor lo soporta
            if server.has_extn("STARTTLS"):
                server.starttls()
                server.ehlo()
        
        # Login con la App Password de 16 letras (si aplica)
        if smtp_auth:
            server.login(email_real_user, email_pass)
        server.send_message(msg)
        server.quit()
        
        return True

    except KeyError as e:
        st.error(f"❌ Error de configuración: No se encuentra la clave {e} en el archivo de secretos.")
        return False
        
    except Exception as e:
        # Si sale error 535 aquí, revisa que la clave de 16 letras sea la correcta
        st.error(f"Error enviando correo: {e}") 
        return False
