#!/usr/bin/env python3
"""
PRUEBA REAL DE ATAQUE - Sin teoría, solo resultados
"""
import requests
import time
import threading
from datetime import datetime

API_URL = "https://stsweb-backend-964379250608.europe-west1.run.app"
FRONTEND_URL = "https://staging.swarcotrafficspain.com"

print("="*60)
print("ATAQUE REAL A LA APLICACION")
print("="*60)
print(f"Frontend: {FRONTEND_URL}")
print(f"Backend: {API_URL}")
print(f"Hora inicio: {datetime.now().strftime('%H:%M:%S')}")
print("="*60)

# TEST 1: ¿La app está viva?
print("\n[TEST 1] ¿Aplicación respondiendo?")
try:
    r = requests.get(f"{API_URL}/api/health", timeout=10)  # 10s para cold start
    if r.status_code == 200:
        print(f"[OK] Backend VIVO - {r.status_code} - {r.json()}")
    else:
        print(f"[ERROR] Backend responde pero con error: {r.status_code}")
except Exception as e:
    print(f"[DEAD] Backend MUERTO: {str(e)}")

try:
    r = requests.get(FRONTEND_URL, timeout=5)
    if r.status_code == 200:
        print(f"[OK] Frontend VIVO - {r.status_code}")
    else:
        print(f"[WARN] Frontend codigo: {r.status_code}")
except Exception as e:
    print(f"[DEAD] Frontend MUERTO: {str(e)}")

# TEST 2: Ataque de login masivo (probar rate limiter)
print("\n[TEST 2] Ataque de fuerza bruta - 50 logins falsos")
print("(Si Redis funciona, debe bloquear después de 5 intentos)")

start = time.time()
bloqueados = 0
exitosos = 0

for i in range(50):
    try:
        r = requests.post(
            f"{API_URL}/api/auth/login",
            json={"identifier": "attacker@evil.com", "password": "wrong"},
            timeout=10  # Aumentar timeout
        )
        if r.status_code == 429:  # Rate limited
            bloqueados += 1
        elif r.status_code == 401:  # Login failed but not blocked
            exitosos += 1
    except:
        pass

duration = time.time() - start
print(f"[TIME] Duracion: {duration:.2f}s")
print(f"[BLOCKED] Bloqueados por rate limiter: {bloqueados}/50")
print(f"[PASS] Pasaron sin bloqueo: {exitosos}/50")

if bloqueados > 0:
    print("[OK] RATE LIMITER FUNCIONA (Redis activo)")
else:
    print("[ERROR] RATE LIMITER NO FUNCIONA (posible problema)")

# TEST 3: Velocidad de respuesta del backend
print("\n[TEST 3] Velocidad de respuesta (10 requests)")
tiempos = []

for i in range(10):
    start = time.time()
    try:
        r = requests.get(f"{API_URL}/api/health", timeout=5)
        duration = time.time() - start
        tiempos.append(duration)
    except:
        pass

if tiempos:
    avg = sum(tiempos) / len(tiempos) * 1000  # en ms
    max_time = max(tiempos) * 1000
    min_time = min(tiempos) * 1000
    print(f"[STATS] Promedio: {avg:.0f}ms")
    print(f"[STATS] Mas rapido: {min_time:.0f}ms")
    print(f"[STATS] Mas lento: {max_time:.0f}ms")
    
    if avg < 200:
        print("[OK] EXCELENTE velocidad (<200ms)")
    elif avg < 500:
        print("[WARN] Velocidad aceptable (200-500ms)")
    else:
        print("[ERROR] Muy lento (>500ms)")

# TEST 4: Carga simultánea (simular usuarios reales)
print("\n[TEST 4] Carga simultánea - 20 usuarios al mismo tiempo")

resultados = {"exitosos": 0, "fallidos": 0}
lock = threading.Lock()

def usuario_simultaneo():
    try:
        r = requests.get(f"{API_URL}/api/health", timeout=10)  # Aumentar timeout
        with lock:
            if r.status_code == 200:
                resultados["exitosos"] += 1
            else:
                resultados["fallidos"] += 1
    except:
        with lock:
            resultados["fallidos"] += 1

start = time.time()
threads = []
for i in range(20):
    t = threading.Thread(target=usuario_simultaneo)
    threads.append(t)
    t.start()

for t in threads:
    t.join()

duration = time.time() - start

print(f"[TIME] Duracion: {duration:.2f}s")
print(f"[OK] Exitosos: {resultados['exitosos']}/20")
print(f"[ERROR] Fallidos: {resultados['fallidos']}/20")

if resultados['exitosos'] >= 18:
    print("[OK] Sistema ESTABLE con carga simultanea")
else:
    print("[WARN] Sistema inestable bajo carga")

# RESUMEN FINAL
print("\n" + "="*60)
print("RESUMEN DEL ATAQUE")
print("="*60)
print(f"Hora fin: {datetime.now().strftime('%H:%M:%S')}")
print("\n¿El sistema sobrevivió? 👆 Ver resultados arriba")
print("="*60)
