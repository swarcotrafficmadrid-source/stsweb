import requests

API_URL = "https://stsweb-backend-964379250608.europe-west1.run.app"

# Credenciales a probar
credentials = [
    {"identifier": "aitor.badiola@swarco.com", "password": "Aitor/85"},
]

print("="*60)
print("TEST DE LOGIN")
print("="*60)

for cred in credentials:
    print(f"\n[TEST] Intentando login con: {cred['identifier']}")
    
    try:
        r = requests.post(
            f"{API_URL}/api/auth/login",
            json=cred,
            timeout=10
        )
        
        print(f"[STATUS] {r.status_code}")
        print(f"[RESPONSE] {r.text[:200]}")
        
        if r.status_code == 200:
            print("[OK] LOGIN EXITOSO")
            break
        elif r.status_code == 401:
            print("[ERROR] Credenciales invalidas")
        elif r.status_code == 429:
            print("[WARN] Rate limiter bloqueando")
        else:
            print(f"[ERROR] Codigo inesperado: {r.status_code}")
            
    except Exception as e:
        print(f"[ERROR] Excepcion: {e}")

print("\n" + "="*60)
