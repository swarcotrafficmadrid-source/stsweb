import streamlit as st
import estilos

import tickets
import tickets_sat
import repuestos
import equipos_nuevos


def _logout():
    st.session_state.usuario = None
    st.session_state.rol = None
    st.session_state.user_email = None
    st.session_state.nombre = None
    st.session_state.pagina_actual = 'menu'
    st.rerun()

def mostrar_menu(conn, t):
    estilos.mostrar_logo()
    st.markdown(f'<p class="swarco-title">{t.get("menu_tit", "Menú")}</p>', unsafe_allow_html=True)
    st.caption(t.get("menu_sub", "Seleccione una opción"))

    if st.button(f"👤 {t.get('btn_perfil', 'Mis Datos')}"):
        st.session_state.pagina_actual = 'perfil'
        st.rerun()
    if st.button(f"📝 {t.get('btn_tickets', 'Tickets Rápidos')}"):
        st.session_state.pagina_actual = 'tickets'
        st.rerun()
    if st.button(f"🧰 {t.get('btn_tickets_sat', 'Reporte SAT')}"):
        st.session_state.pagina_actual = 'tickets_sat'
        st.rerun()
    if st.button(f"📦 {t.get('btn_repuestos', 'Repuestos')}"):
        st.session_state.pagina_actual = 'repuestos'
        st.rerun()
    if st.button(f"🚜 {t.get('btn_equipos_nuevos', 'Equipos Nuevos')}"):
        st.session_state.pagina_actual = 'equipos_nuevos'
        st.rerun()

    if st.button(f"🚪 {t.get('btn_logout', 'Cerrar Sesión')}"):
        _logout()


def _perfil(conn, t):
    estilos.mostrar_logo()
    st.markdown(f'<p class="swarco-title">{t.get("perfil_tit", "Mis Datos")}</p>', unsafe_allow_html=True)

    with st.form("perfil_form"):
        nombre = st.text_input(t.get("perfil_nombre", "Nombre Completo"), value=st.session_state.get("nombre") or "")
        email = st.text_input(t.get("perfil_email", "Email"), value=st.session_state.get("user_email") or "")
        usuario = st.text_input(t.get("perfil_usuario", "Usuario"), value=st.session_state.get("usuario") or "", disabled=True)
        rol = st.text_input(t.get("perfil_rol", "Rol"), value=st.session_state.get("rol") or "", disabled=True)
        pass_new = st.text_input(t.get("perfil_pass_new", "Nueva Contraseña"), type="password")
        pass_conf = st.text_input(t.get("perfil_pass_confirm", "Confirmar Nueva Contraseña"), type="password")
        submit = st.form_submit_button(t.get("perfil_guardar", "Guardar Cambios"))

    if submit:
        if pass_new and pass_new != pass_conf:
            st.error(t.get("perfil_pass_mismatch", "Las contraseñas no coinciden"))
            return
        try:
            df = conn.read(worksheet="usuarios")
            if df is None or df.empty:
                st.error(t.get("perfil_update_err", "No se pudo actualizar: {msg}").format(msg="No hay usuarios"))
                return
            if "usuario" not in df.columns:
                st.error(t.get("perfil_update_err", "No se pudo actualizar: {msg}").format(msg="Columnas inválidas"))
                return

            idx = df.index[df["usuario"] == st.session_state.usuario]
            if len(idx) == 0:
                st.error(t.get("perfil_update_err", "No se pudo actualizar: {msg}").format(msg="Usuario no encontrado"))
                return

            i = idx[0]
            df.at[i, "nombre"] = nombre
            df.at[i, "email"] = email
            if pass_new:
                import usuarios
                df.at[i, "password"] = usuarios.hash_password(pass_new)
            conn.update(worksheet="usuarios", data=df)

            st.session_state.nombre = nombre
            st.session_state.user_email = email
            st.success(t.get("perfil_update_ok", "✅ Datos actualizados"))
        except Exception as e:
            st.error(t.get("perfil_update_err", "No se pudo actualizar: {msg}").format(msg=str(e)))

    if st.button(f"⬅️ {t.get('btn_volver', 'VOLVER')}"):
        st.session_state.pagina_actual = 'menu'
        st.rerun()


def app(conn, t):
    pagina = st.session_state.get("pagina_actual", "menu")
    if pagina == "menu":
        mostrar_menu(conn, t)
    elif pagina == "tickets":
        tickets.interfaz_tickets(conn, t)
    elif pagina == "tickets_sat":
        tickets_sat.interfaz_tickets(conn, t)
    elif pagina == "repuestos":
        repuestos.mostrar_repuestos(conn, t)
    elif pagina == "equipos_nuevos":
        equipos_nuevos.mostrar_equipos_nuevos(t)
    elif pagina == "perfil":
        _perfil(conn, t)
    else:
        mostrar_menu(conn, t)
