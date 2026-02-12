"""
SII (Servicio de Impuestos Internos) Integration Service
Sincronización automática de facturas electrónicas

Documentación completa en: INTEGRACION_WHATSAPP_SII.md
"""

import os
import requests
from datetime import datetime, timedelta
from lxml import etree

class SIIService:
    def __init__(self):
        self.base_url = "https://maullin.sii.cl"  # URL de prueba
        # self.base_url = "https://palena.sii.cl"  # URL de producción
        
    def authenticate(self, rut, password):
        """
        Autenticar con el SII usando RUT y clave tributaria
        
        Args:
            rut: RUT de la empresa (formato: 12345678-9)
            password: Clave tributaria del SII
        
        Returns:
            str: Token de sesión si exitoso, None si falla
        """
        url = f"{self.base_url}/cgi_dte/UPL/DTEUpload"
        
        payload = {
            'RUT': rut,
            'PASSWORD': password
        }
        
        try:
            response = requests.post(url, data=payload, timeout=30)
            
            if response.status_code == 200:
                # Extraer token de la respuesta
                # TODO: Implementar parsing de token real
                return "TOKEN_PLACEHOLDER"
            else:
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"Error autenticando con SII: {e}")
            return None
    
    def get_facturas_emitidas(self, token, rut, fecha_desde=None, fecha_hasta=None):
        """
        Obtiene facturas emitidas (ventas) desde el SII
        
        Args:
            token: Token de autenticación
            rut: RUT de la empresa
            fecha_desde: Fecha inicial (datetime)
            fecha_hasta: Fecha final (datetime)
        
        Returns:
            list: Lista de facturas emitidas
        """
        if not fecha_desde:
            fecha_desde = datetime.now() - timedelta(days=30)
        if not fecha_hasta:
            fecha_hasta = datetime.now()
        
        url = f"{self.base_url}/cgi_dte/UPL/DTEUpload"
        
        headers = {
            'Authorization': f'Bearer {token}'
        }
        
        params = {
            'RUT': rut,
            'DESDE': fecha_desde.strftime('%Y-%m-%d'),
            'HASTA': fecha_hasta.strftime('%Y-%m-%d'),
            'TIPO': 'EMITIDAS'
        }
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=30)
            
            if response.status_code == 200:
                # Parse XML response
                facturas = self._parse_facturas_xml(response.content)
                return facturas
            else:
                return []
                
        except requests.exceptions.RequestException as e:
            print(f"Error obteniendo facturas emitidas: {e}")
            return []
    
    def get_facturas_recibidas(self, token, rut, fecha_desde=None, fecha_hasta=None):
        """
        Obtiene facturas recibidas (compras) desde el SII
        
        Similar a get_facturas_emitidas pero para egresos
        """
        if not fecha_desde:
            fecha_desde = datetime.now() - timedelta(days=30)
        if not fecha_hasta:
            fecha_hasta = datetime.now()
        
        url = f"{self.base_url}/cgi_dte/UPL/DTEUpload"
        
        headers = {
            'Authorization': f'Bearer {token}'
        }
        
        params = {
            'RUT': rut,
            'DESDE': fecha_desde.strftime('%Y-%m-%d'),
            'HASTA': fecha_hasta.strftime('%Y-%m-%d'),
            'TIPO': 'RECIBIDAS'
        }
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=30)
            
            if response.status_code == 200:
                facturas = self._parse_facturas_xml(response.content)
                return facturas
            else:
                return []
                
        except requests.exceptions.RequestException as e:
            print(f"Error obteniendo facturas recibidas: {e}")
            return []
    
    def _parse_facturas_xml(self, xml_content):
        """
        Parse del XML de facturas electrónicas del SII
        
        Args:
            xml_content: Contenido XML en bytes
        
        Returns:
            list: Lista de diccionarios con datos de facturas
        """
        facturas = []
        
        try:
            root = etree.fromstring(xml_content)
            
            # TODO: Implementar parsing real según estructura XML del SII
            # Estructura típica de DTE (Documento Tributario Electrónico):
            # - Folio: Número de factura
            # - Fecha: Fecha de emisión
            # - RutEmisor / RznSocEmisor: RUT y razón social del emisor
            # - RutReceptor / RznSocReceptor: RUT y razón social del receptor
            # - MntNeto: Monto neto
            # - MntIVA: Monto IVA
            # - MntTotal: Monto total
            
            for dte in root.findall('.//DTE'):
                factura = {
                    'folio': dte.findtext('.//Folio'),
                    'fecha_emision': dte.findtext('.//FchEmis'),
                    'rut_emisor': dte.findtext('.//RUTEmisor'),
                    'razon_social_emisor': dte.findtext('.//RznSoc'),
                    'rut_receptor': dte.findtext('.//RUTRecep'),
                    'razon_social_receptor': dte.findtext('.//RznSocRecep'),
                    'monto_neto': float(dte.findtext('.//MntNeto', '0')),
                    'iva': float(dte.findtext('.//IVA', '0')),
                    'monto_total': float(dte.findtext('.//MntTotal', '0'))
                }
                facturas.append(factura)
                
        except etree.XMLSyntaxError as e:
            print(f"Error parsing XML del SII: {e}")
        
        return facturas
    
    def sync_user_invoices(self, user_data):
        """
        Sincroniza todas las facturas de un usuario
        
        Args:
            user_data: dict con datos del usuario (rut, sii_password, etc.)
        
        Returns:
            dict: Resultado de la sincronización
        """
        # Autenticar
        token = self.authenticate(user_data['rut'], user_data['sii_password'])
        
        if not token:
            return {
                'success': False,
                'message': 'Error de autenticación con SII'
            }
        
        # Obtener facturas emitidas (ventas)
        emitidas = self.get_facturas_emitidas(token, user_data['rut'])
        
        # Obtener facturas recibidas (compras)
        recibidas = self.get_facturas_recibidas(token, user_data['rut'])
        
        return {
            'success': True,
            'emitidas': len(emitidas),
            'recibidas': len(recibidas),
            'facturas_emitidas': emitidas,
            'facturas_recibidas': recibidas
        }

# Instancia global
sii_service = SIIService()
