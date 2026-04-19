#!/usr/bin/env python3
"""
Script para mostrar instrucciones de configuración de Supabase
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables de entorno
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

def show_instructions(filepath):
    """Muestra instrucciones paso a paso"""
    
    supabase_url = os.getenv('SUPABASE_URL', 'https://haqjuyagyvxynmulanhe.supabase.co')
    
    sql_file = Path(filepath)
    if not sql_file.exists():
        print(f"❌ Error: Archivo no encontrado: {filepath}")
        return False
    
    # Leer el SQL
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    print(f"📖 Archivo encontrado: {sql_file.name}")
    print(f"📏 Tamaño: {len(sql_content)} caracteres\n")
    
    print("="*70)
    print("📝 INSTRUCCIONES PARA CONFIGURAR SUPABASE")
    print("="*70 + "\n")
    
    print("PASO 1: Abrir el SQL Editor de Supabase")
    print(f"   🔗 {supabase_url}/project/_/sql\n")
    
    print("PASO 2: Click en 'New Query' (Nueva Consulta)\n")
    
    print("PASO 3: Copiar el siguiente SQL:")
    print("   📂 Archivo: setup/CREATE_USER_BUSINESS_PROFILES.sql\n")
    
    print("PASO 4: Pegar el SQL en el editor y click en 'Run' ▶️\n")
    
    print("="*70)
    print("💡 CONTENIDO DEL SQL (COPIA ESTO)")
    print("="*70 + "\n")
    print(sql_content)
    print("\n" + "="*70)
    
    print("\n✅ Después de ejecutar el SQL:")
    print("   - La tabla 'user_business_profiles' estará creada")
    print("   - Las 4 políticas RLS estarán activas")
    print("   - Los 3 índices estarán configurados")
    print("   - El trigger de updated_at funcionará")
    
    print("\n🚀 Luego podrás probar el onboarding en:")
    print("   http://localhost:5000/empresa/onboarding")
    
    return True

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 PYMAX - Guía de Configuración de Supabase")
    print("="*70 + "\n")
    
    sql_file = Path(__file__).parent / 'CREATE_USER_BUSINESS_PROFILES.sql'
    show_instructions(sql_file)
    
    print("\n" + "="*70)
    print("¿Todo listo? Presiona Enter para continuar...")
    input()
