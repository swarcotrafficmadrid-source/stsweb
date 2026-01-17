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

def enviar_correo_bienvenida(destinatario, nombre, usuario, password_real):
    try:
        # --- CAMBIO CRÍTICO AQUÍ ---
        # Antes buscaba ["smtp"]["email"], ahora busca lo que tú tienes:
        email_real_user = st.secrets["emails"]["user"]
        email_pass = st.secrets["emails"]["password"]
        
        smtp_server = "smtp.gmail.com"
        smtp_port = 587

        # Alias (Esto se mantiene igual)
        email_alias = "ticket@swarcotrafficspain.com"

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

        # Conexión SMTP
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
