import requests
import threading
import time
from datetime import datetime

API_URL = "https://stsweb-backend-964379250608.europe-west1.run.app"
FRONTEND_URL = "https://staging.swarcotrafficspain.com"

# Test de carga progresiva
def test_progressive_load():
    print("\n" + "="*60)
    print("TEST PROGRESIVO DE CARGA")
    print("="*60)
    
    for num_users in [10, 25, 50, 100, 200]:
        print(f"\n[TEST] {num_users} usuarios simultaneos...")
        
        results = {"success": 0, "fail": 0}
        start = time.time()
        
        def hit_api():
            try:
                r = requests.get(f"{API_URL}/health", timeout=10)
                if r.status_code == 200:
                    results["success"] += 1
                else:
                    results["fail"] += 1
            except:
                results["fail"] += 1
        
        threads = [threading.Thread(target=hit_api) for _ in range(num_users)]
        for t in threads: t.start()
        for t in threads: t.join()
        
        duration = time.time() - start
        success_rate = (results["success"] / num_users) * 100
        
        print(f"[TIME] {duration:.2f}s")
        print(f"[SUCCESS] {results['success']}/{num_users} ({success_rate:.1f}%)")
        print(f"[FAIL] {results['fail']}/{num_users}")
        
        if success_rate < 90:
            print(f"[WARN] Sistema empieza a fallar con {num_users} usuarios")
            break
        else:
            print(f"[OK] Sistema estable con {num_users} usuarios")
        
        time.sleep(2)

# Test de login intensivo
def test_login_stress():
    print("\n" + "="*60)
    print("TEST DE LOGIN BAJO CARGA (100 intentos)")
    print("="*60)
    
    results = {"success": 0, "fail": 0, "blocked": 0}
    start = time.time()
    
    def attempt_login():
        try:
            r = requests.post(
                f"{API_URL}/api/auth/login",
                json={"email": "test@test.com", "password": "wrong"},
                timeout=10
            )
            if r.status_code == 429:
                results["blocked"] += 1
            elif r.status_code in [401, 400]:
                results["success"] += 1
            else:
                results["fail"] += 1
        except:
            results["fail"] += 1
    
    threads = [threading.Thread(target=attempt_login) for _ in range(100)]
    for t in threads: t.start()
    for t in threads: t.join()
    
    duration = time.time() - start
    print(f"[TIME] {duration:.2f}s")
    print(f"[BLOCKED] {results['blocked']}/100 (por rate limiter)")
    print(f"[SUCCESS] {results['success']}/100 (respondieron correctamente)")
    print(f"[FAIL] {results['fail']}/100 (errores de red/timeout)")
    
    if results["blocked"] > 0:
        print("[OK] Rate limiter FUNCIONANDO")
    else:
        print("[WARN] Rate limiter no esta bloqueando")

# Test de velocidad sostenida
def test_sustained_load():
    print("\n" + "="*60)
    print("TEST DE CARGA SOSTENIDA (30 segundos)")
    print("="*60)
    
    end_time = time.time() + 30
    request_count = 0
    errors = 0
    
    def make_request():
        nonlocal request_count, errors
        try:
            r = requests.get(f"{API_URL}/health", timeout=5)
            if r.status_code == 200:
                request_count += 1
            else:
                errors += 1
        except:
            errors += 1
    
    print("[INFO] Enviando requests continuos por 30 segundos...")
    
    while time.time() < end_time:
        threads = [threading.Thread(target=make_request) for _ in range(10)]
        for t in threads: t.start()
        for t in threads: t.join()
        time.sleep(0.1)
    
    print(f"[STATS] Total requests: {request_count + errors}")
    print(f"[STATS] Exitosos: {request_count}")
    print(f"[STATS] Fallidos: {errors}")
    print(f"[STATS] Success rate: {(request_count/(request_count+errors)*100):.1f}%")
    print(f"[STATS] Throughput: {request_count/30:.1f} req/s")

if __name__ == "__main__":
    print("="*60)
    print("PRUEBA DE ESTRES EXTREMA")
    print("="*60)
    print(f"Hora inicio: {datetime.now().strftime('%H:%M:%S')}")
    
    # Test 1: Carga progresiva
    test_progressive_load()
    
    # Test 2: Login stress
    test_login_stress()
    
    # Test 3: Carga sostenida
    test_sustained_load()
    
    print("\n" + "="*60)
    print("PRUEBA COMPLETADA")
    print("="*60)
    print(f"Hora fin: {datetime.now().strftime('%H:%M:%S')}")
