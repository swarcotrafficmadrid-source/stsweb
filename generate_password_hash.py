import bcrypt

# Generar hash de la contraseña Aitor/85
password = "Aitor/85"
hash_result = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(10))
hash_string = hash_result.decode('utf-8')

print("="*60)
print("HASH GENERADO PARA: Aitor/85")
print("="*60)
print(f"\n{hash_string}\n")
print("="*60)
print("\nCopia este hash y ejecuta en MySQL:")
print("="*60)
print(f"""
UPDATE usuarios 
SET passwordHash = '{hash_string}' 
WHERE email = 'aitor.badiola@swarco.com';
""")
print("="*60)
