# 🔍 VERIFICACIÓN DE DOMINIO

Tu dominio **swarcotrafficspain.com** apuntaba al portal y ahora sale un error de Streamlit.

---

## 🎯 EN CLOUD SHELL - Ejecuta estos comandos:

```bash
# 1. Ver mapeos de dominio del frontend
gcloud run domain-mappings list --region europe-west1

# 2. Ver configuración del servicio stsweb
gcloud run services describe stsweb --region europe-west1 --format="get(status.url)"

# 3. Ver si hay un dominio mapeado
gcloud run services describe stsweb --region europe-west1 --format json | grep -i domain -A 5
```

---

## 🌐 POSIBLES CAUSAS:

### Causa 1: Dominio no mapeado
- El dominio se desmapeó accidentalmente
- **Solución:** Re-mapear el dominio

### Causa 2: DNS cambió
- Los registros DNS apuntan a otro lugar
- **Solución:** Verificar DNS en Google Domains/Squarespace

### Causa 3: Servicio en error
- El servicio stsweb no está respondiendo
- **Solución:** Verificar revisiones activas

---

**Ejecuta los 3 comandos en Cloud Shell y pégame los resultados.**
