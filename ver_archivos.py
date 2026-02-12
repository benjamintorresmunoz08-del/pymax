import os

print("--- LISTA DE ARCHIVOS REALES ---")
archivos = os.listdir('.')
encontrado = False

for archivo in archivos:
    if ".env" in archivo:
        print(f"👉 ENCONTRÉ ESTO: '{archivo}'")
        if archivo == ".env":
            encontrado = True
        else:
            print("   ⚠️ ¡CUIDADO! Tiene nombre incorrecto (seguramente es .txt)")

if not encontrado:
    print("❌ NO VEO EL ARCHIVO .env POR NINGÚN LADO.")
else:
    print("✅ El archivo se llama correctamente .env")
print("--------------------------------")