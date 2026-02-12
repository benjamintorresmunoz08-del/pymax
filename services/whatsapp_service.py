"""
WhatsApp Business API Integration Service
Documentación completa en: INTEGRACION_WHATSAPP_SII.md
"""

import os
import requests
from openai import OpenAI

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

class WhatsAppService:
    def __init__(self):
        self.api_url = "https://graph.facebook.com/v18.0"
        self.phone_number_id = os.getenv('WHATSAPP_PHONE_NUMBER_ID')
        self.access_token = os.getenv('WHATSAPP_ACCESS_TOKEN')
    
    def send_message(self, to_number, message):
        """Envía un mensaje de texto a un número de WhatsApp"""
        url = f"{self.api_url}/{self.phone_number_id}/messages"
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'messaging_product': 'whatsapp',
            'to': to_number,
            'type': 'text',
            'text': {'body': message}
        }
        
        response = requests.post(url, json=payload, headers=headers)
        return response.json()
    
    def process_audio_message(self, audio_url, user):
        """
        Procesa un mensaje de audio:
        1. Descarga el audio
        2. Transcribe con Whisper
        3. Clasifica con GPT-4o
        4. Registra en Supabase
        """
        # TODO: Implementar descarga de audio desde WhatsApp
        # TODO: Implementar transcripción con Whisper
        # TODO: Implementar clasificación con GPT-4o
        # TODO: Integrar con Supabase para guardar operación
        
        return {
            'status': 'pending',
            'message': 'Función en desarrollo - Ver INTEGRACION_WHATSAPP_SII.md'
        }
    
    def process_text_message(self, text, user):
        """
        Procesa un mensaje de texto:
        1. Clasifica con GPT-4o
        2. Registra en Supabase
        """
        # TODO: Implementar clasificación directa
        
        return {
            'status': 'pending',
            'message': 'Función en desarrollo'
        }
    
    def process_image_message(self, image_url, user):
        """
        Procesa una imagen (boleta/factura):
        1. Descarga la imagen
        2. Extrae texto con OCR (Google Vision)
        3. Clasifica con GPT-4o
        4. Registra en Supabase
        """
        # TODO: Implementar OCR
        
        return {
            'status': 'pending',
            'message': 'Función en desarrollo'
        }
    
    def classify_with_ai(self, text, user_context):
        """
        Clasifica una transacción usando GPT-4o
        
        Args:
            text: Texto del mensaje del usuario
            user_context: Contexto del usuario (historial, industria, etc.)
        
        Returns:
            dict: {type, amount, concept, category, counterparty, confidence}
        """
        prompt = f"""
Eres un asistente financiero experto en contabilidad chilena.

Usuario: {user_context.get('name', 'Usuario')}
Rubro: {user_context.get('industry', 'General')}

Mensaje del usuario:
"{text}"

Extrae y clasifica esta transacción.

Responde SOLO en formato JSON válido:
{{
    "type": "ingreso" o "egreso",
    "amount": número sin símbolos ni puntos,
    "concept": "descripción clara",
    "category": "categoría contable",
    "counterparty": "cliente o proveedor si aplica",
    "confidence": número entre 0.0 y 1.0
}}

Notas importantes:
- "lucas" = miles de pesos (ej: "50 lucas" = 50000)
- "palo" o "millón" = millones de pesos
- Si falta información crítica, usa confidence < 0.7
- Categorías comunes: Ventas, Insumos, Logística, RRHH, Arriendo, Servicios
"""
        
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            return {
                'error': str(e),
                'status': 'failed'
            }

# Instancia global
whatsapp_service = WhatsAppService()
