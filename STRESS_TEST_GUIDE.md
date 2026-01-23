# 🧪 GUÍA DE PRUEBAS DE ESTRÉS

**Objetivo:** Verificar que el sistema soporta carga alta sin caerse

---

## 📦 INSTALACIÓN DE k6

### Windows (PowerShell como Administrador):
```powershell
choco install k6
```

O descarga desde: https://k6.io/docs/get-started/installation/

### Linux/Mac:
```bash
# Homebrew
brew install k6

# Apt (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

---

## 🎯 ANTES DE CORRER LAS PRUEBAS:

### 1. Crear usuarios de prueba:

**En Cloud Shell:**
```bash
cd ~/stsweb/backend

# Exportar credenciales de BD
export DB_USER=swarco
export DB_PASSWORD=Lacroix2026
export DB_NAME=swarco_ops
export DB_HOST=127.0.0.1
export DB_PORT=3306

# Iniciar proxy (en otra terminal)
cloud_sql_proxy -instances=ticketswarcotrafficspain:europe-west1:swarco-mysql=tcp:3306

# Crear usuarios de prueba
node -e "
const bcrypt = require('bcrypt');
const { User, sequelize } = require('./src/models/index.js');

async function createTestUsers() {
  await sequelize.authenticate();
  
  const users = [
    { email: 'test1@swarco.com', password: 'Test1234!', nombre: 'Test', apellidos: 'User 1', empresa: 'SWARCO Test' },
    { email: 'test2@swarco.com', password: 'Test1234!', nombre: 'Test', apellidos: 'User 2', empresa: 'SWARCO Test' },
    { email: 'test3@swarco.com', password: 'Test1234!', nombre: 'Test', apellidos: 'User 3', empresa: 'SWARCO Test' },
  ];
  
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await User.findOrCreate({
      where: { email: u.email },
      defaults: { ...u, password: hash, userRole: 'client', active: true }
    });
    console.log('✅ Created:', u.email);
  }
  
  process.exit(0);
}

createTestUsers();
"
```

---

## 🚀 EJECUTAR PRUEBAS:

### Prueba 1: Load Test (Carga Normal)
```bash
cd C:\Users\abadiola\stm-web

k6 run stress-test.js
```

**Qué hace:**
- 0-10 usuarios en 1 min (warm up)
- 10-50 usuarios en 3 min (ramp up)
- 50 usuarios por 5 min (sustained)
- 50-100 usuarios en 2 min (spike)
- 100 usuarios por 5 min (peak)
- 100-0 usuarios en 2 min (ramp down)

**Duración total:** ~18 minutos

---

### Prueba 2: Spike Test (Picos de Tráfico)
```bash
k6 run --stages '0:0s,200:10s,0:30s' stress-test.js
```

**Qué hace:**
- 0-200 usuarios en 10 segundos
- Mantiene 0 usuarios por 30 segundos

**Objetivo:** Ver cómo responde a picos repentinos

---

### Prueba 3: Soak Test (Resistencia)
```bash
k6 run --vus 50 --duration 1h stress-test.js
```

**Qué hace:**
- 50 usuarios constantes durante 1 hora

**Objetivo:** Detectar memory leaks o degradación

---

### Prueba 4: Stress Test (Romper el Sistema)
```bash
k6 run --vus 500 --duration 10m stress-test.js
```

**Qué hace:**
- 500 usuarios concurrentes por 10 minutos

**Objetivo:** Encontrar el punto de quiebre

---

## 📊 INTERPRETAR RESULTADOS:

### Métricas Clave:

```
http_req_duration
  ├─ avg:    Latencia promedio (debe ser <1s)
  ├─ p(95):  95% de requests (debe ser <2s)
  └─ p(99):  99% de requests (debe ser <5s)

http_req_failed
  └─ rate:   % de requests fallidas (debe ser <5%)

checks
  └─ rate:   % de validaciones exitosas (debe ser >95%)

errors
  └─ rate:   % de errores generales (debe ser <10%)

login_success
  └─ rate:   % de logins exitosos (debe ser >98%)

ticket_creation_success
  └─ rate:   % de tickets creados (debe ser >95%)
```

---

## ✅ CRITERIOS DE ÉXITO:

```
✅ EXCELENTE:
   - p(95) < 1s
   - http_req_failed < 1%
   - checks > 99%
   - 0 errores críticos

✅ BUENO:
   - p(95) < 2s
   - http_req_failed < 5%
   - checks > 95%
   - < 10 errores críticos

⚠️ ACEPTABLE:
   - p(95) < 5s
   - http_req_failed < 10%
   - checks > 90%
   - < 50 errores críticos

❌ MALO:
   - p(95) > 5s
   - http_req_failed > 10%
   - checks < 90%
   - > 50 errores críticos
```

---

## 🔍 MONITOREO DURANTE PRUEBAS:

### En Google Cloud Console:

1. **Cloud Run Metrics:**
   - https://console.cloud.google.com/run
   - Ver CPU, memoria, latencia, errores

2. **Cloud SQL Metrics:**
   - https://console.cloud.google.com/sql
   - Ver conexiones, queries, latencia

3. **Cloud Monitoring:**
   - https://console.cloud.google.com/monitoring
   - Ver alertas, dashboards

### Comandos útiles:

```bash
# Ver logs en tiempo real (backend)
gcloud run services logs read stsweb-backend --region europe-west1 --follow

# Ver logs en tiempo real (frontend)
gcloud run services logs read stsweb --region europe-west1 --follow

# Ver métricas de CPU/Memoria
gcloud run services describe stsweb-backend --region europe-west1 --format json | grep -A 5 "metrics"
```

---

## 🚨 QUÉ BUSCAR (Problemas Comunes):

### 1. **Timeouts aumentan con carga**
```
http_req_duration p(95): 8000ms  ❌ MALO
```
**Causa:** BD sobrecargada o queries lentas  
**Fix:** Índices, conexión pool, caching

---

### 2. **Rate de errores >5%**
```
http_req_failed: 12%  ❌ MALO
```
**Causa:** Limits de Cloud Run, rate limiting agresivo  
**Fix:** Aumentar instancias, ajustar rate limits

---

### 3. **Login falla bajo carga**
```
login_success rate: 75%  ❌ MALO
```
**Causa:** bcrypt bloqueando CPU  
**Fix:** Usar rounds más bajos (10 en vez de 12)

---

### 4. **Crear ticket falla**
```
ticket_creation_success: 60%  ❌ MALO
```
**Causa:** Webhooks bloqueando, transacciones lentas  
**Fix:** Webhooks en background, optimizar queries

---

### 5. **Memory leak**
```
Memoria aumenta de 200MB a 450MB en 30 min  ⚠️
```
**Causa:** Objetos no liberados, listeners no removidos  
**Fix:** Revisar event listeners, cerrar conexiones

---

## 📋 CHECKLIST POST-TESTING:

```
[ ] p(95) < 2s ✅
[ ] Error rate < 5% ✅
[ ] Login success > 98% ✅
[ ] Ticket creation > 95% ✅
[ ] No memory leaks ✅
[ ] CPU < 80% promedio ✅
[ ] Memoria < 400MB promedio ✅
[ ] No 500 errors en logs ✅
[ ] BD connections < 80% pool ✅
[ ] Webhooks no bloquean ✅
```

---

## 🎯 EJEMPLO DE RESULTADO BUENO:

```
scenarios: (100.00%) 1 scenario, 100 max VUs, 18m30s max duration
default: 100 VUs for 18m0s

     ✓ login status 200
     ✓ login tiene token
     ✓ login < 2s
     ✓ dashboard status 200
     ✓ dashboard es array
     ✓ dashboard < 3s
     ✓ crear ticket status 201
     ✓ crear ticket tiene ID
     ✓ crear ticket < 5s
     ✓ chatbot status 200
     ✓ chatbot responde
     ✓ chatbot < 1s

     checks.........................: 99.12% ✅ 
     data_received..................: 145 MB  
     data_sent......................: 82 MB   
     errors.........................: 0.88%  ✅ 
     http_req_duration..............: avg=892ms   p(95)=1.8s  ✅
     http_req_failed................: 2.34%  ✅ 
     http_reqs......................: 45234  
     iteration_duration.............: avg=14.2s 
     iterations.....................: 9047   
     login_success..................: 98.67% ✅ 
     ticket_creation_success........: 96.45% ✅ 
     vus............................: 100    
     vus_max........................: 100    
```

✅ **VEREDICTO: SISTEMA ROBUSTO**

---

## 📞 PRÓXIMOS PASOS:

Si las pruebas fallan:
1. Implementar CRITICAL_FIXES.md
2. Aumentar recursos de Cloud Run (memoria, CPU)
3. Optimizar queries de BD
4. Implementar caching (Redis)
5. Queue para webhooks

---

**Duración de pruebas:** 18 minutos (load test completo)  
**Frecuencia recomendada:** Antes de cada release mayor  
**Responsable:** DevOps / QA Team
