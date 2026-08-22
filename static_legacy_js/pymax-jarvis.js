/**
 * ═══════════════════════════════════════════════════════════════
 * PYMAX JARVIS AI - INTERACTIVE HOLOGRAM FUNCTIONS
 * Sistema interactivo del asistente holográfico tipo Iron Man
 * ═══════════════════════════════════════════════════════════════
 */

// ============================================
// JARVIS HOLOGRAM - FUNCIONES INTERACTIVAS
// ============================================

// Función para que JARVIS hable
function jarvisSpeak(message) {
  if (!window.pymaxJarvis) {
    console.error('❌ JARVIS not initialized');
    return;
  }
  
  if (!message) {
    // Mensaje basado en situación financiera
    const stats = window.pymaxData?.getFinancialStats('month') || { balance: 0, margin: 0 };
    
    if (stats.margin > 20) {
      message = 'Excellent work, Sir. Your financial systems are performing at optimal levels. Current margin is ' + stats.margin + '%.';
    } else if (stats.margin > 10) {
      message = 'Systems are stable, Sir. However, I recommend reviewing expense optimization strategies.';
    } else {
      message = 'Sir, I must inform you - current financial metrics require immediate attention.';
    }
  }
  
  window.pymaxJarvis.setState('speaking', 'Speaking...');
  
  // Actualizar mensaje en UI
  document.getElementById('jarvisVoiceMessage').innerHTML = `
    <p class="text-slate-200 text-base leading-relaxed" style="font-family: 'Inter', sans-serif;">
      <span class="text-cyan-400 font-bold">JARVIS:</span> ${message}
    </p>
  `;
  
  // TTS si está disponible
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.volume = 1.0;
    
    utterance.onend = () => {
      window.pymaxJarvis.idle();
    };
    
    window.speechSynthesis.speak(utterance);
  } else {
    setTimeout(() => {
      window.pymaxJarvis.idle();
    }, 3000);
  }
  
  console.log('🤖 JARVIS speaking:', message);
}

// Función para análisis de IA
function jarvisAnalyze() {
  if (!window.pymaxJarvis) {
    console.error('❌ JARVIS not initialized');
    return;
  }
  
  window.pymaxJarvis.setState('processing', 'Analyzing financial data...');
  
  const stats = window.pymaxData?.getFinancialStats('month') || { balance: 0, margin: 0, operations: 0 };
  const operations = window.pymaxData?.getData('operations') || [];
  
  // Simular análisis
  setTimeout(() => {
    // Calcular score
    let score = 50;
    if (stats.balance > 1000000) score += 30;
    else if (stats.balance > 500000) score += 20;
    else if (stats.balance > 100000) score += 10;
    
    if (stats.margin > 30) score += 20;
    else if (stats.margin > 20) score += 15;
    else if (stats.margin > 10) score += 10;
    
    score = Math.min(100, score);
    
    let analysis = '';
    if (score >= 80) {
      analysis = 'Analysis complete, Sir. All systems optimal. Financial health score: ' + score + '/100. I recommend maintaining current strategies.';
    } else if (score >= 60) {
      analysis = 'Sir, analysis shows good performance with room for improvement. Score: ' + score + '/100. I have prepared optimization recommendations.';
    } else {
      analysis = 'Sir, analysis reveals concerning patterns. Score: ' + score + '/100. Immediate strategic intervention recommended.';
    }
    
    jarvisSpeak(analysis);
    
    // Mostrar notificación
    if (window.pymaxNotifications) {
      pymaxNotifications.show('AI Analysis completed: Score ' + score + '/100', 'success');
    }
    
  }, 2000);
}

// Función para system check
function jarvisAlert() {
  if (!window.pymaxJarvis) {
    console.error('❌ JARVIS not initialized');
    return;
  }
  
  window.pymaxJarvis.setState('alert', 'Running system diagnostics...');
  
  const stats = window.pymaxData?.getFinancialStats('month') || { balance: 0, income: 0, expenses: 0 };
  const operations = window.pymaxData?.getData('operations') || [];
  
  // Verificar alertas
  setTimeout(() => {
    // Calcular runway simple
    let runway = null;
    if (operations.length >= 7) {
      const netBalance = stats.income - stats.expenses;
      if (netBalance < 0 && Math.abs(netBalance) > 0) {
        runway = stats.balance / Math.abs(netBalance);
      }
    }
    
    let message = '';
    if (runway !== null && runway < 3) {
      message = 'ALERT: Critical runway detected, Sir. Current projection: ' + runway.toFixed(1) + ' months. Immediate action required.';
    } else if (stats.expenses > stats.income) {
      message = 'Warning: Expenses exceed income this month, Sir. Recommend cost reduction protocols.';
    } else {
      message = 'All systems nominal, Sir. No critical alerts detected. Financial systems operating within normal parameters.';
    }
    
    jarvisSpeak(message);
    
    // Mostrar notificación
    if (window.pymaxNotifications) {
      const type = runway !== null && runway < 3 ? 'error' : stats.expenses > stats.income ? 'warning' : 'success';
      pymaxNotifications.show('System check completed', type);
    }
    
  }, 1500);
}

// Actualizar header de JARVIS
function updateJarvisHeader(stats, operations) {
  // Actualizar Health Score
  let score = 50;
  
  if (stats.balance > 1000000) score += 30;
  else if (stats.balance > 500000) score += 20;
  else if (stats.balance > 100000) score += 10;
  else if (stats.balance > 0) score += 5;
  
  if (stats.margin > 30) score += 20;
  else if (stats.margin > 20) score += 15;
  else if (stats.margin > 10) score += 10;
  else if (stats.margin > 0) score += 5;
  
  score = Math.min(100, Math.max(0, score));
  
  const scoreElement = document.getElementById('jarvisHealthScore');
  if (scoreElement) {
    scoreElement.textContent = score;
  }
  
  // Contar alertas
  let alertCount = 0;
  if (stats.balance < 100000) alertCount++;
  if (stats.expenses > stats.income) alertCount++;
  
  const alertsElement = document.getElementById('jarvisAlerts');
  if (alertsElement) {
    alertsElement.textContent = alertCount;
  }
  
  // Mensaje inicial de JARVIS
  const userName = window.DEMO_USER?.user_metadata?.full_name?.split(' ')[0] || 'Sir';
  const hour = new Date().getHours();
  
  let greeting = '';
  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning';
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Good afternoon';
  } else {
    greeting = 'Good evening';
  }
  
  const efficiency = score >= 80 ? 'optimal' : score >= 60 ? 'good' : 'suboptimal';
  const initialMessage = `${greeting}, ${userName}. Your financial systems are online and operating at ${efficiency} efficiency. How may I assist you today?`;
  
  const messageElement = document.getElementById('jarvisVoiceMessage');
  if (messageElement) {
    messageElement.innerHTML = `
      <p class="text-slate-200 text-base leading-relaxed" style="font-family: 'Inter', sans-serif;">
        <span class="text-cyan-400 font-bold">${greeting}, ${userName}.</span> Your financial systems are online and operating at ${efficiency} efficiency. How may I assist you today?
      </p>
    `;
  }
}

// Inicializar JARVIS en el header
function initJarvisHeader() {
  console.log('🤖 Initializing JARVIS Hologram AI in header...');
  
  // Crear instancia de JARVIS
  window.pymaxJarvis = new PymaxHologram({
    containerId: 'pymaxHologramJarvis'
  });
  
  const jarvisSuccess = window.pymaxJarvis.init();
  
  if (jarvisSuccess) {
    console.log('✅ JARVIS Hologram AI initialized successfully');
    
    // Estado inicial idle
    setTimeout(() => {
      window.pymaxJarvis.idle();
    }, 500);
    
    // Actualizar stats del header después de 1 segundo
    setTimeout(() => {
      if (window.pymaxData) {
        const stats = pymaxData.getFinancialStats('month');
        const operations = pymaxData.getData('operations');
        updateJarvisHeader(stats, operations);
      }
    }, 1000);
    
    // Mensaje de bienvenida
    setTimeout(() => {
      jarvisSpeak('Systems initialized, Sir. Standing by for your command.');
    }, 2000);
  } else {
    console.error('❌ Failed to initialize JARVIS Hologram');
  }
}

// Agregar animaciones CSS para scanline
if (!document.getElementById('jarvis-scanline-animations')) {
  const style = document.createElement('style');
  style.id = 'jarvis-scanline-animations';
  style.textContent = `
    @keyframes scanline-sweep {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  document.head.appendChild(style);
}

// Exportar funciones globalmente
window.jarvisSpeak = jarvisSpeak;
window.jarvisAnalyze = jarvisAnalyze;
window.jarvisAlert = jarvisAlert;
window.updateJarvisHeader = updateJarvisHeader;
window.initJarvisHeader = initJarvisHeader;

console.log('✅ JARVIS Interactive Functions loaded');
