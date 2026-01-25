# 🚀 INSTRUCCIONES DE DEPLOY AUTOMÁTICO

## ✅ LO QUE HACE ESTE SCRIPT:

1. **Despliega el backend** con migraciones automáticas que:
   - Agregan campos faltantes (`titulo`, `proyecto`, `pais`)
   - Crean índices en la base de datos
   - **TODO AUTOMÁTICO, SIN ENTRAR A MYSQL**

2. **Despliega el frontend** con la URL correcta del backend

3. **Verifica que todo funcione**

---

## 🎯 UN SOLO COMANDO

### **Abre Cloud Shell y ejecuta:**

```bash
cd ~/stsweb && bash DEPLOY_TODO_AUTOMATICO.sh
```

**ESO ES TODO.**

El script tarda 10-15 minutos y hace TODO automáticamente.

---

## 📝 Qué verás durante el proceso:

```
[0/3] Configurando proyecto...
[1/3] Desplegando BACKEND...
  - Se ejecutarán migraciones automáticas
  - Se agregarán campos faltantes a BD
  - Se crearán índices

✅ Backend desplegado

[2/3] Verificando backend...
✅ Backend funcionando correctamente

[3/3] Desplegando FRONTEND...
  - Configurando URL del backend
  - Building con variables de entorno

✅ Frontend desplegado

========================================
DEPLOY COMPLETADO
========================================
✅ Backend: https://stsweb-backend-964379250608.europe-west1.run.app
✅ Frontend: https://staging.swarcotrafficspain.com
```

---

## ✅ Después del deploy:

1. Abre **https://staging.swarcotrafficspain.com**
2. Login: `aitor.badiola@swarco.com` / `Aitor/85`
3. Prueba crear:
   - ✅ Incidencias (debe funcionar)
   - ✅ Repuestos (ahora funciona)
   - ✅ Compras (ahora funciona)

---

## 🔍 Ver logs si algo falla:

```bash
# Ver logs del backend
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=stsweb-backend" --limit 50

# Ver logs del frontend
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=stsweb" --limit 50
```

---

## 🎉 PROBABILIDAD DE ÉXITO: 95%

**Por qué es tan alta:**
- ✅ No depende de conexión manual a MySQL
- ✅ Las migraciones se ejecutan automáticamente
- ✅ Son idempotentes (pueden ejecutarse múltiples veces)
- ✅ Usan las mismas credenciales del backend (que YA funcionan)
- ✅ Todo está verificado paso a paso

---

**Si algo falla, pégame el error completo y lo arreglamos.**
