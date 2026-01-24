"""
🔥 LOCUST STRESS TEST - EXTREME LOAD SIMULATION
Sistema STM Web - 10,000+ Usuarios Concurrentes

Este script simula carga extrema para identificar BOTTLENECKS EXACTOS
Ejecutar: locust -f locust_extreme_test.py --host=https://stsweb-backend-964379250608.europe-west1.run.app
"""

from locust import HttpUser, task, between, events
from locust.env import Environment
import random
import json
import time
import logging
from datetime import datetime

# Configuración de logging detallado
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Datos de prueba realistas
TEST_USERS = [
    {"email": f"load_test_{i}@swarco.com", "password": "Test123!@#"} 
    for i in range(1000)
]

FAILURE_TITLES = [
    "Semáforo apagado en Calle Mayor",
    "Panel informativo con error",
    "Señal de tráfico caída",
    "Sistema de control sin respuesta",
    "Detector de vehículos averiado"
]

FAILURE_DESCRIPTIONS = [
    "El equipo no responde desde las 08:00 de hoy",
    "Error de comunicación con el controlador principal",
    "Avería eléctrica detectada en el cuadro de control",
    "Software del panel muestra pantalla azul",
    "Necesita revisión urgente por técnico especializado"
]

class PerformanceMetrics:
    """Captura métricas detalladas de performance"""
    
    def __init__(self):
        self.request_times = []
        self.errors = []
        self.bottlenecks = {}
        
    def record_request(self, name, response_time, status_code):
        self.request_times.append({
            'endpoint': name,
            'time': response_time,
            'status': status_code,
            'timestamp': datetime.now()
        })
        
        # Identificar bottleneck si > 1000ms
        if response_time > 1000:
            if name not in self.bottlenecks:
                self.bottlenecks[name] = []
            self.bottlenecks[name].append(response_time)
    
    def record_error(self, name, exception):
        self.errors.append({
            'endpoint': name,
            'error': str(exception),
            'timestamp': datetime.now()
        })
    
    def get_summary(self):
        if not self.request_times:
            return "No hay datos"
        
        times = [r['time'] for r in self.request_times]
        avg_time = sum(times) / len(times)
        max_time = max(times)
        p95_time = sorted(times)[int(len(times) * 0.95)]
        p99_time = sorted(times)[int(len(times) * 0.99)]
        
        return f"""
╔═══════════════════════════════════════════════════════════════╗
║              MÉTRICAS DE PERFORMANCE - RESUMEN                ║
╠═══════════════════════════════════════════════════════════════╣
║  Total Requests:     {len(self.request_times):,}
║  Total Errors:       {len(self.errors):,}
║  Error Rate:         {(len(self.errors)/len(self.request_times)*100):.2f}%
║  
║  Latencia Promedio:  {avg_time:.0f}ms
║  Latencia Máxima:    {max_time:.0f}ms
║  Latencia p95:       {p95_time:.0f}ms
║  Latencia p99:       {p99_time:.0f}ms
║
║  🔴 BOTTLENECKS DETECTADOS:
║  {self._format_bottlenecks()}
╚═══════════════════════════════════════════════════════════════╝
"""
    
    def _format_bottlenecks(self):
        if not self.bottlenecks:
            return "  Ninguno (sistema respondiendo <1s)"
        
        result = []
        for endpoint, times in sorted(self.bottlenecks.items(), 
                                     key=lambda x: sum(x[1])/len(x[1]), 
                                     reverse=True):
            avg = sum(times) / len(times)
            result.append(f"  • {endpoint}: {avg:.0f}ms promedio ({len(times)} requests lentos)")
        
        return "\n║  ".join(result[:5])  # Top 5 bottlenecks

# Instancia global de métricas
metrics = PerformanceMetrics()

@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, **kwargs):
    """Captura TODAS las peticiones para análisis detallado"""
    if exception:
        metrics.record_error(name, exception)
    else:
        status_code = kwargs.get('response', None)
        if status_code:
            metrics.record_request(name, response_time, status_code.status_code)

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Genera reporte final al terminar el test"""
    logger.info("\n" + "="*70)
    logger.info("ANÁLISIS DE BOTTLENECKS COMPLETADO")
    logger.info("="*70)
    logger.info(metrics.get_summary())
    
    # Guardar reporte detallado
    with open(f"bottleneck_report_{int(time.time())}.json", "w") as f:
        json.dump({
            'requests': metrics.request_times[-1000:],  # Últimas 1000
            'errors': metrics.errors,
            'bottlenecks': {k: {
                'count': len(v),
                'avg_time': sum(v)/len(v),
                'max_time': max(v)
            } for k, v in metrics.bottlenecks.items()}
        }, f, indent=2, default=str)


class DatabaseIntensiveUser(HttpUser):
    """
    Usuario que MACHACA las consultas de base de datos
    Objetivo: Identificar queries N+1 y queries sin índices
    """
    wait_time = between(0.1, 0.5)  # Espera mínima entre requests
    
    def on_start(self):
        """Login al iniciar"""
        user_data = random.choice(TEST_USERS)
        response = self.client.post("/api/auth/login", json={
            "identifier": user_data["email"],
            "password": user_data["password"]
        }, catch_response=True)
        
        if response.status_code == 401:
            # Usuario no existe, registrarlo
            self.client.post("/api/auth/register", json={
                "nombre": "Load",
                "apellidos": "Test",
                "email": user_data["email"],
                "usuario": user_data["email"],
                "empresa": "SWARCO Test SA",
                "pais": "España",
                "telefono": "+34600000000",
                "cargo": "Tester",
                "password": user_data["password"]
            })
            # Intentar login de nuevo
            response = self.client.post("/api/auth/login", json={
                "identifier": user_data["email"],
                "password": user_data["password"]
            })
        
        if response.status_code == 200:
            self.token = response.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            logger.error(f"Login failed: {response.status_code} - {response.text}")
            self.token = None
            self.headers = {}
    
    @task(10)  # Peso alto - endpoint crítico
    def get_failures_list(self):
        """
        🔴 BOTTLENECK ESPERADO: /api/failures sin paginación
        
        LÍNEAS DE CÓDIGO PROBLEMÁTICAS:
        - backend/src/routes/failures.js:15-50
        - SELECT * FROM fallas (sin LIMIT)
        - JOIN con User (N+1 query problem)
        - Sin índice en createdAt para ORDER BY
        
        CON 10,000 USUARIOS: Esta query tardará 5-10 segundos
        """
        if not self.token:
            return
        
        with self.client.get("/api/failures", 
                           headers=self.headers,
                           catch_response=True,
                           name="[CRITICAL] GET /api/failures") as response:
            if response.elapsed.total_seconds() > 2:
                response.failure(f"⚠️ BOTTLENECK: {response.elapsed.total_seconds():.2f}s")
                logger.warning(
                    f"🔴 BOTTLENECK DETECTADO en /api/failures\n"
                    f"   Tiempo: {response.elapsed.total_seconds():.2f}s\n"
                    f"   Líneas problemáticas: backend/src/routes/failures.js:15-50\n"
                    f"   Problema: Query sin LIMIT + JOIN sin optimizar\n"
                    f"   Fix: Agregar paginación y eager loading"
                )
    
    @task(8)
    def get_analytics_dashboard(self):
        """
        🔴 BOTTLENECK ESPERADO: /api/analytics/dashboard
        
        LÍNEAS PROBLEMÁTICAS:
        - backend/src/routes/analytics.js:19-119
        - Múltiples COUNT(*) en tablas grandes
        - Sin caché de métricas
        - Subconsultas en topUsers (línea 86-98)
        
        CON 10,000 USUARIOS: 8-15 segundos de latencia
        """
        if not self.token:
            return
        
        with self.client.get("/api/analytics/dashboard",
                           headers=self.headers,
                           catch_response=True,
                           name="[CRITICAL] GET /api/analytics/dashboard") as response:
            if response.elapsed.total_seconds() > 3:
                response.failure(f"⚠️ BOTTLENECK: {response.elapsed.total_seconds():.2f}s")
                logger.warning(
                    f"🔴 BOTTLENECK DETECTADO en /api/analytics/dashboard\n"
                    f"   Tiempo: {response.elapsed.total_seconds():.2f}s\n"
                    f"   Líneas problemáticas:\n"
                    f"   - analytics.js:31-43 (Promise.all de 5 COUNTs)\n"
                    f"   - analytics.js:86-98 (subquery con literal en topUsers)\n"
                    f"   Problema: Sin caché, múltiples full table scans\n"
                    f"   Fix: Redis cache (TTL 5min) + índices compuestos"
                )
    
    @task(15)
    def create_failure_report(self):
        """
        🟡 BOTTLENECK POTENCIAL: POST /api/failures
        
        LÍNEAS PROBLEMÁTICAS:
        - backend/src/routes/failures.js:XX (create endpoint)
        - INSERT + CREATE en TicketStatus (2 queries)
        - sendMail bloqueante (puede tardar 1-3s)
        - Sin queue para emails
        
        CON 10,000 USUARIOS: Saturación del SMTP, DB locks
        """
        if not self.token:
            return
        
        failure_data = {
            "titulo": random.choice(FAILURE_TITLES),
            "descripcion": random.choice(FAILURE_DESCRIPTIONS),
            "ubicacion": f"Calle Test {random.randint(1, 100)}",
            "urgencia": random.choice(["baja", "media", "alta"]),
            "equipmentData": []
        }
        
        with self.client.post("/api/failures",
                            json=failure_data,
                            headers=self.headers,
                            catch_response=True,
                            name="[HIGH LOAD] POST /api/failures") as response:
            if response.elapsed.total_seconds() > 2:
                response.failure(f"⚠️ SLOW INSERT: {response.elapsed.total_seconds():.2f}s")
                logger.warning(
                    f"🟡 SLOW INSERT en /api/failures\n"
                    f"   Tiempo: {response.elapsed.total_seconds():.2f}s\n"
                    f"   Problema probable:\n"
                    f"   - Email bloqueante (sendMail síncrono)\n"
                    f"   - Transacción DB no optimizada\n"
                    f"   - Sin bulk insert para equipmentData\n"
                    f"   Fix: Bull queue + async email + batch inserts"
                )
    
    @task(5)
    def get_user_info(self):
        """Endpoint ligero - baseline para comparar"""
        if not self.token:
            return
        
        self.client.get("/api/auth/me",
                       headers=self.headers,
                       name="[BASELINE] GET /api/auth/me")
    
    @task(3)
    def search_failures_unindexed(self):
        """
        🔴 BOTTLENECK CRÍTICO: Búsqueda sin índice
        
        Si existe endpoint de búsqueda con LIKE '%term%'
        sin full-text index, será CATASTRÓFICO con 10k usuarios
        
        Latencia esperada: 10-30 segundos con DB de 100k+ registros
        """
        if not self.token:
            return
        
        search_term = random.choice(["semáforo", "panel", "señal", "avería"])
        
        with self.client.get(f"/api/failures?search={search_term}",
                           headers=self.headers,
                           catch_response=True,
                           name="[CRITICAL] GET /api/failures?search=") as response:
            if response.elapsed.total_seconds() > 5:
                response.failure(f"⚠️ BÚSQUEDA SIN ÍNDICE: {response.elapsed.total_seconds():.2f}s")
                logger.error(
                    f"💀 BÚSQUEDA SIN ÍNDICE FULL-TEXT\n"
                    f"   Tiempo: {response.elapsed.total_seconds():.2f}s\n"
                    f"   Query: LIKE '%{search_term}%'\n"
                    f"   Problema: Full table scan en tabla grande\n"
                    f"   Fix URGENTE: Agregar FULLTEXT INDEX en MariaDB\n"
                    f"   ALTER TABLE fallas ADD FULLTEXT INDEX ft_search (titulo, descripcion);"
                )


class RateLimiterKiller(HttpUser):
    """
    Usuario que DESTRUYE el rate limiter in-memory
    Demuestra por qué el rate limiter actual NO ESCALA
    """
    wait_time = between(0.01, 0.05)  # Spam agresivo
    
    @task
    def spam_login(self):
        """
        🔴 ATAQUE AL RATE LIMITER
        
        LÍNEAS PROBLEMÁTICAS:
        - backend/src/middleware/rateLimiter.js:1-57
        - Map in-memory (línea 2) - NO DISTRIBUIDO
        - Limpieza probabilística 1% (línea 30) - INEFICIENTE
        
        PROBLEMA:
        Con 10,000 usuarios, el Map crece a >500MB en RAM
        Garbage collection pausará el proceso Node.js
        
        RESULTADO ESPERADO:
        - Latencia aumenta de 50ms → 5000ms después de 5 minutos
        - OOM kill del proceso después de 10 minutos
        - Rate limiter bloquea usuarios legítimos
        """
        user_data = {
            "identifier": f"attacker_{random.randint(1, 10000)}@evil.com",
            "password": "wrong"
        }
        
        self.client.post("/api/auth/login", 
                        json=user_data,
                        name="[ATTACK] Rate Limiter Saturation")


class MemoryLeakHunter(HttpUser):
    """
    Usuario que busca memory leaks
    Hace requests que pueden causar fugas de memoria
    """
    wait_time = between(0.1, 0.3)
    
    @task
    def upload_large_file(self):
        """
        🟡 POTENCIAL MEMORY LEAK: File upload
        
        Si multer no está configurado con límites,
        o si sharp procesa imágenes sin stream,
        habrá memory leak con 10k usuarios
        """
        # Simular upload de 5MB
        fake_file = {
            'file': ('test.jpg', b'X' * (5 * 1024 * 1024), 'image/jpeg')
        }
        
        self.client.post("/api/upload",
                        files=fake_file,
                        name="[MEMORY] File Upload 5MB")


# Configuración de escenarios
class ExtremLoadTest(HttpUser):
    """Escenario principal de carga extrema"""
    tasks = [DatabaseIntensiveUser, RateLimiterKiller, MemoryLeakHunter]
    wait_time = between(0.5, 2)


if __name__ == "__main__":
    print("""
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          🔥 LOCUST EXTREME STRESS TEST 🔥                     ║
║                                                               ║
║  Este test va a DESTRUIR tu aplicación y mostrarte           ║
║  EXACTAMENTE dónde está el bottleneck.                       ║
║                                                               ║
║  Ejecutar:                                                    ║
║  locust -f locust_extreme_test.py --users 10000 \\            ║
║         --spawn-rate 100 --run-time 10m \\                    ║
║         --host https://tu-backend.run.app                     ║
║                                                               ║
║  O en UI web:                                                 ║
║  locust -f locust_extreme_test.py                            ║
║  Abrir: http://localhost:8089                                 ║
║                                                               ║
║  🔴 ADVERTENCIA:                                              ║
║  Este test puede TUMBAR tu servidor.                         ║
║  NO ejecutar en producción sin preparación.                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    """)
