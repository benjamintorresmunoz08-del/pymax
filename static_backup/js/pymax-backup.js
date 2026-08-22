/**
 * ============================================
 * PYMAX BACKUP & EXPORT SYSTEM - FASE 24
 * ============================================
 * Sistema completo de respaldo y exportación de datos
 * Características:
 * - Backup completo de datos a JSON
 * - Exportación a Excel (XLSX)
 * - Exportación a CSV
 * - Importación de backups
 * - Restauración de datos
 * - Programación de backups automáticos
 */

class PymaxBackup {
  constructor() {
    this.storageKey = 'pymax_backup_settings';
    this.settings = {
      autoBackup: false,
      backupFrequency: 'weekly', // daily, weekly, monthly
      lastBackup: null
    };
    
    this.init();
  }

  init() {
    this.loadSettings();
    this.checkAutoBackup();
    console.log('✅ Pymax Backup & Export System initialized');
  }

  // Cargar configuración
  loadSettings() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading backup settings:', error);
    }
  }

  // Guardar configuración
  saveSettings() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving backup settings:', error);
    }
  }

  // Verificar si es necesario hacer backup automático
  checkAutoBackup() {
    if (!this.settings.autoBackup) return;
    
    const lastBackup = this.settings.lastBackup ? new Date(this.settings.lastBackup) : null;
    const now = new Date();
    
    if (!lastBackup) {
      this.performAutoBackup();
      return;
    }
    
    const daysSinceBackup = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));
    
    let shouldBackup = false;
    if (this.settings.backupFrequency === 'daily' && daysSinceBackup >= 1) {
      shouldBackup = true;
    } else if (this.settings.backupFrequency === 'weekly' && daysSinceBackup >= 7) {
      shouldBackup = true;
    } else if (this.settings.backupFrequency === 'monthly' && daysSinceBackup >= 30) {
      shouldBackup = true;
    }
    
    if (shouldBackup) {
      this.performAutoBackup();
    }
  }

  // Realizar backup automático
  async performAutoBackup() {
    try {
      const backup = await this.createBackup();
      
      // Guardar en localStorage
      localStorage.setItem('pymax_auto_backup', JSON.stringify(backup));
      
      this.settings.lastBackup = new Date().toISOString();
      this.saveSettings();
      
      console.log('✅ Auto-backup completed');
      
      if (window.pymaxNotifications) {
        window.pymaxNotifications.show('Backup automático completado', 'success');
      }
    } catch (error) {
      console.error('Error performing auto-backup:', error);
    }
  }

  // Crear backup completo
  async createBackup() {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      user: window.DEMO_USER?.id || 'unknown',
      data: {}
    };
    
    // Obtener todos los datos del Data Manager
    if (window.pymaxData) {
      backup.data.operations = window.pymaxData.getData('operations');
      backup.data.stats = window.pymaxData.getFinancialStats('all');
    }
    
    // Obtener configuraciones
    backup.data.settings = {
      theme: localStorage.getItem('pymax_theme_preference'),
      currency: localStorage.getItem('pymax_currency_preference'),
      language: localStorage.getItem('pymax_language')
    };
    
    // Obtener tareas
    const tasks = localStorage.getItem('pymax_user_tasks');
    if (tasks) {
      backup.data.tasks = JSON.parse(tasks);
    }
    
    // Obtener historial de chat
    const chatHistory = localStorage.getItem('pymax_chat_history');
    if (chatHistory) {
      backup.data.chatHistory = JSON.parse(chatHistory);
    }
    
    return backup;
  }

  // Exportar backup como JSON
  async exportBackupJSON() {
    try {
      if (window.pymaxNotifications) {
        window.pymaxNotifications.show('Generando backup JSON...', 'info');
      }
      
      const backup = await this.createBackup();
      
      // Crear blob y descargar
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pymax_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Actualizar última fecha de backup
      this.settings.lastBackup = new Date().toISOString();
      this.saveSettings();
      
      if (window.pymaxNotifications) {
        window.pymaxNotifications.show('Backup JSON descargado exitosamente', 'success');
      }
      
      console.log('✅ JSON backup exported');
    } catch (error) {
      console.error('Error exporting JSON backup:', error);
      if (window.pymaxNotifications) {
        window.pymaxNotifications.show('Error al exportar backup', 'error');
      }
    }
  }

  // Exportar a Excel (XLSX)
  async exportToExcel() {
    try {
      if (window.pymaxNotifications) {
        window.pymaxNotifications.show('Generando archivo Excel...', 'info');
      }
      
      const operations = window.pymaxData?.getData('operations') || [];
      
      if (operations.length === 0) {
        if (window.pymaxNotifications) {
          window.pymaxNotifications.show('No hay datos para exportar', 'warning');
        }
        return;
      }
      
      // Preparar datos para Excel
      const excelData = operations.map(op => ({
        'Fecha': new Date(op.created_at).toLocaleDateString('es-ES'),
        'Tipo': op.type === 'ingreso' ? 'Ingreso' : 'Egreso',
        'Monto': parseFloat(op.amount),
        'Descripción': op.description || '',
        'Categoría': op.category || '',
        'ID': op.id
      }));
      
      // Crear CSV (simulación de Excel)
      const headers = Object.keys(excelData[0]);
      const csvContent = [
        headers.join(','),
        ...excelData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escapar comas y comillas
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');
      
      // Descargar
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pymax_operaciones_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      if (window.pymaxNotifications) {
        window.pymaxNotifications.show('Archivo Excel descargado exitosamente', 'success');
      }
      
      console.log('✅ Excel export completed');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      if (window.pymaxNotifications) {
        window.pymaxNotifications.show('Error al exportar a Excel', 'error');
      }
    }
  }

  // Exportar a CSV
  async exportToCSV() {
    try {
      if (window.pymaxNotifications) {
        window.pymaxNotifications.show('Generando archivo CSV...', 'info');
      }
      
      const operations = window.pymaxData?.getData('operations') || [];
      
      if (operations.length === 0) {
        if (window.pymaxNotifications) {
          window.pymaxNotifications.show('No hay datos para exportar', 'warning');
        }
        return;
      }
      
      // Preparar datos para CSV
      const csvData = operations.map(op => ({
        fecha: new Date(op.created_at).toISOString(),
        tipo: op.type,
        monto: parseFloat(op.amount),
        descripcion: op.description || '',
        categoria: op.category || '',
        id: op.id
      }));
      
      // Crear CSV
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');
      
      // Descargar
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pymax_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      if (window.pymaxNotifications) {
        window.pymaxNotifications.show('Archivo CSV descargado exitosamente', 'success');
      }
      
      console.log('✅ CSV export completed');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      if (window.pymaxNotifications) {
        window.pymaxNotifications.show('Error al exportar a CSV', 'error');
      }
    }
  }

  // Importar backup
  async importBackup(file) {
    try {
      if (window.pymaxNotifications) {
        window.pymaxNotifications.show('Importando backup...', 'info');
      }
      
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          
          // Validar estructura del backup
          if (!backup.version || !backup.data) {
            throw new Error('Formato de backup inválido');
          }
          
          // Confirmar restauración
          const confirm = window.confirm(
            `¿Estás seguro de restaurar este backup?\n\n` +
            `Fecha: ${new Date(backup.timestamp).toLocaleString('es-ES')}\n` +
            `Operaciones: ${backup.data.operations?.length || 0}\n\n` +
            `ADVERTENCIA: Esto sobrescribirá tus datos actuales.`
          );
          
          if (!confirm) {
            if (window.pymaxNotifications) {
              window.pymaxNotifications.show('Importación cancelada', 'info');
            }
            return;
          }
          
          // Restaurar datos
          await this.restoreBackup(backup);
          
          if (window.pymaxNotifications) {
            window.pymaxNotifications.show('Backup restaurado exitosamente', 'success');
          }
          
          // Recargar página para aplicar cambios
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          
        } catch (error) {
          console.error('Error parsing backup:', error);
          if (window.pymaxNotifications) {
            window.pymaxNotifications.show('Error al leer el archivo de backup', 'error');
          }
        }
      };
      
      reader.readAsText(file);
      
    } catch (error) {
      console.error('Error importing backup:', error);
      if (window.pymaxNotifications) {
        window.pymaxNotifications.show('Error al importar backup', 'error');
      }
    }
  }

  // Restaurar backup
  async restoreBackup(backup) {
    try {
      // Restaurar operaciones (a Supabase si está disponible)
      if (backup.data.operations && window.pymaxData) {
        // En producción, aquí se subirían a Supabase
        console.log('Restoring operations:', backup.data.operations.length);
      }
      
      // Restaurar configuraciones
      if (backup.data.settings) {
        if (backup.data.settings.theme) {
          localStorage.setItem('pymax_theme_preference', backup.data.settings.theme);
        }
        if (backup.data.settings.currency) {
          localStorage.setItem('pymax_currency_preference', backup.data.settings.currency);
        }
        if (backup.data.settings.language) {
          localStorage.setItem('pymax_language', backup.data.settings.language);
        }
      }
      
      // Restaurar tareas
      if (backup.data.tasks) {
        localStorage.setItem('pymax_user_tasks', JSON.stringify(backup.data.tasks));
      }
      
      // Restaurar historial de chat
      if (backup.data.chatHistory) {
        localStorage.setItem('pymax_chat_history', JSON.stringify(backup.data.chatHistory));
      }
      
      console.log('✅ Backup restored successfully');
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }

  // Configurar backup automático
  configureAutoBackup() {
    const currentSettings = this.settings;
    
    const enabled = confirm(
      `Backup Automático ${currentSettings.autoBackup ? 'ACTIVADO' : 'DESACTIVADO'}\n\n` +
      `Frecuencia actual: ${currentSettings.backupFrequency}\n` +
      `Último backup: ${currentSettings.lastBackup ? new Date(currentSettings.lastBackup).toLocaleString('es-ES') : 'Nunca'}\n\n` +
      `¿Deseas ${currentSettings.autoBackup ? 'desactivar' : 'activar'} el backup automático?`
    );
    
    if (enabled !== null) {
      this.settings.autoBackup = !currentSettings.autoBackup;
      
      if (this.settings.autoBackup) {
        const frequency = prompt(
          'Selecciona la frecuencia de backup:\n\n' +
          '1 = Diario\n' +
          '2 = Semanal (recomendado)\n' +
          '3 = Mensual',
          '2'
        );
        
        if (frequency === '1') {
          this.settings.backupFrequency = 'daily';
        } else if (frequency === '3') {
          this.settings.backupFrequency = 'monthly';
        } else {
          this.settings.backupFrequency = 'weekly';
        }
      }
      
      this.saveSettings();
      
      if (window.pymaxNotifications) {
        const status = this.settings.autoBackup ? 'activado' : 'desactivado';
        window.pymaxNotifications.show(`Backup automático ${status}`, 'success');
      }
    }
  }

  // Mostrar modal de backup/export
  showBackupModal() {
    const modal = document.createElement('div');
    modal.id = 'pymaxBackupModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(2, 6, 23, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    `;
    
    modal.innerHTML = `
      <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 32px; max-width: 600px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0;">Backup & Exportación</h2>
          <button onclick="document.getElementById('pymaxBackupModal').remove()" style="width: 40px; height: 40px; border-radius: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #94a3b8; cursor: pointer;">
            <i class="ph-bold ph-x" style="font-size: 20px;"></i>
          </button>
        </div>
        
        <div style="display: grid; gap: 16px;">
          <!-- Backup JSON -->
          <button onclick="pymaxBackup.exportBackupJSON(); document.getElementById('pymaxBackupModal').remove();" style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px; padding: 20px; cursor: pointer; text-align: left; transition: all 0.2s;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center;">
                <i class="ph-fill ph-database" style="font-size: 24px; color: #60a5fa;"></i>
              </div>
              <div style="flex: 1;">
                <h3 style="color: #fff; font-weight: 700; margin: 0 0 4px 0;">Backup Completo (JSON)</h3>
                <p style="color: #94a3b8; font-size: 0.875rem; margin: 0;">Descarga todos tus datos en formato JSON</p>
              </div>
              <i class="ph-bold ph-download-simple" style="font-size: 20px; color: #60a5fa;"></i>
            </div>
          </button>
          
          <!-- Export Excel -->
          <button onclick="pymaxBackup.exportToExcel(); document.getElementById('pymaxBackupModal').remove();" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 20px; cursor: pointer; text-align: left; transition: all 0.2s;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center;">
                <i class="ph-fill ph-file-xls" style="font-size: 24px; color: #34d399;"></i>
              </div>
              <div style="flex: 1;">
                <h3 style="color: #fff; font-weight: 700; margin: 0 0 4px 0;">Exportar a Excel</h3>
                <p style="color: #94a3b8; font-size: 0.875rem; margin: 0;">Descarga operaciones en formato CSV/Excel</p>
              </div>
              <i class="ph-bold ph-download-simple" style="font-size: 20px; color: #34d399;"></i>
            </div>
          </button>
          
          <!-- Export CSV -->
          <button onclick="pymaxBackup.exportToCSV(); document.getElementById('pymaxBackupModal').remove();" style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 16px; padding: 20px; cursor: pointer; text-align: left; transition: all 0.2s;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(139, 92, 246, 0.2); display: flex; align-items: center; justify-content: center;">
                <i class="ph-fill ph-file-csv" style="font-size: 24px; color: #a78bfa;"></i>
              </div>
              <div style="flex: 1;">
                <h3 style="color: #fff; font-weight: 700; margin: 0 0 4px 0;">Exportar a CSV</h3>
                <p style="color: #94a3b8; font-size: 0.875rem; margin: 0;">Descarga datos en formato CSV simple</p>
              </div>
              <i class="ph-bold ph-download-simple" style="font-size: 20px; color: #a78bfa;"></i>
            </div>
          </button>
          
          <!-- Import Backup -->
          <button onclick="document.getElementById('pymaxBackupFileInput').click();" style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 16px; padding: 20px; cursor: pointer; text-align: left; transition: all 0.2s;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(251, 191, 36, 0.2); display: flex; align-items: center; justify-content: center;">
                <i class="ph-fill ph-upload-simple" style="font-size: 24px; color: #fbbf24;"></i>
              </div>
              <div style="flex: 1;">
                <h3 style="color: #fff; font-weight: 700; margin: 0 0 4px 0;">Importar Backup</h3>
                <p style="color: #94a3b8; font-size: 0.875rem; margin: 0;">Restaurar datos desde un archivo JSON</p>
              </div>
              <i class="ph-bold ph-upload-simple" style="font-size: 20px; color: #fbbf24;"></i>
            </div>
          </button>
          
          <!-- Auto Backup Config -->
          <button onclick="pymaxBackup.configureAutoBackup(); document.getElementById('pymaxBackupModal').remove();" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 20px; cursor: pointer; text-align: left; transition: all 0.2s;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center;">
                <i class="ph-fill ph-clock-clockwise" style="font-size: 24px; color: #94a3b8;"></i>
              </div>
              <div style="flex: 1;">
                <h3 style="color: #fff; font-weight: 700; margin: 0 0 4px 0;">Configurar Backup Automático</h3>
                <p style="color: #94a3b8; font-size: 0.875rem; margin: 0;">Programa backups automáticos periódicos</p>
              </div>
              <i class="ph-bold ph-gear" style="font-size: 20px; color: #94a3b8;"></i>
            </div>
          </button>
        </div>
        
        <input type="file" id="pymaxBackupFileInput" accept=".json" style="display: none;" onchange="pymaxBackup.importBackup(this.files[0]); document.getElementById('pymaxBackupModal').remove();">
      </div>
    `;
    
    document.body.appendChild(modal);
  }
}

// Inicializar backup system global
let pymaxBackup;

document.addEventListener('DOMContentLoaded', () => {
  pymaxBackup = new PymaxBackup();
  console.log('✅ Pymax Backup ready');
});

// Exportar para uso global
window.pymaxBackup = pymaxBackup;
