// PYMAX TASKS SYSTEM - Professional Task Management
// Beautiful modal and task management system

// Tasks storage
let tasks = JSON.parse(localStorage.getItem('pymaxTasks') || '[]');

// Open Task Modal
function openTaskModal() {
  const modal = document.getElementById('taskModal');
  if (modal) {
    modal.classList.add('active');
    document.getElementById('taskNameInput').focus();
  }
}

// Close Task Modal  
function closeTaskModal() {
  const modal = document.getElementById('taskModal');
  if (modal) {
    modal.classList.remove('active');
    // Clear inputs
    document.getElementById('taskNameInput').value = '';
    document.getElementById('taskDescInput').value = '';
  }
}

// Add new task
function addTaskFromModal() {
  const taskName = document.getElementById('taskNameInput').value.trim();
  const taskDesc = document.getElementById('taskDescInput').value.trim();
  
  if (!taskName) {
    alert('Por favor ingresa un nombre para la tarea');
    return;
  }
  
  const newTask = {
    id: Date.now(),
    name: taskName,
    description: taskDesc,
    createdAt: new Date().toISOString(),
    completed: false
  };
  
  tasks.push(newTask);
  localStorage.setItem('pymaxTasks', JSON.stringify(tasks));
  
  // Update UI
  updateTasksDisplay();
  closeTaskModal();
  
  // Show success notification
  showNotification('Tarea agregada correctamente', 'success');
}

// Delete task
function deleteTask(taskId) {
  if (confirm('¿Estás seguro de eliminar esta tarea?')) {
    tasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem('pymaxTasks', JSON.stringify(tasks));
    updateTasksDisplay();
    showNotification('Tarea eliminada', 'info');
  }
}

// Update tasks display
function updateTasksDisplay() {
  const pendingTasks = tasks.filter(t => !t.completed);
  const taskCount = pendingTasks.length;
  
  // Update counter
  const taskText = document.getElementById('pendingTasksText');
  if (taskText) {
    taskText.textContent = `${taskCount} tareas pendientes`;
  }
  
  // Update welcome message based on tasks
  const tasksInfo = document.querySelector('.tasks-info div');
  const tasksCheck = document.querySelector('.tasks-check');
  
  if (taskCount === 0) {
    // No tasks
    if (tasksInfo) {
      tasksInfo.innerHTML = '¡Todo listo! No tienes tareas pendientes';
      tasksInfo.style.color = '#1f2937';
    }
    if (tasksCheck) {
      tasksCheck.style.background = '#38A169';
      tasksCheck.innerHTML = '<i class="ph-bold ph-check"></i>';
    }
  } else {
    // Has tasks - show them
    if (tasksInfo) {
      tasksInfo.innerHTML = `
        <div style="margin-bottom: 12px; font-weight: 600; color: #1f2937; font-size: 14px;">
          ${taskCount} tarea${taskCount > 1 ? 's' : ''} pendiente${taskCount > 1 ? 's' : ''}:
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; max-height: 120px; overflow-y: auto;">
          ${pendingTasks.map(task => `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 600; color: #111827;">${task.name}</div>
                ${task.description ? `<div style="font-size: 11px; color: #6b7280; margin-top: 2px;">${task.description}</div>` : ''}
              </div>
              <button onclick="deleteTask(${task.id})" style="background: #fee2e2; color: #dc2626; border: none; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                ×
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }
    if (tasksCheck) {
      tasksCheck.style.background = '#f59e0b';
      tasksCheck.innerHTML = `<span style="font-size: 18px; font-weight: 800;">${taskCount}</span>`;
    }
  }
  
  // Update tasks list if exists
  const tasksList = document.getElementById('tasksList');
  if (tasksList && pendingTasks.length > 0) {
    tasksList.innerHTML = pendingTasks.map(task => `
      <div class="task-item">
        <div class="task-item-content">
          <div class="task-item-text">${task.name}</div>
          ${task.description ? `<div class="task-item-desc">${task.description}</div>` : ''}
        </div>
        <button class="task-item-delete" onclick="deleteTask(${task.id})">
          <i class="ph-bold ph-x"></i>
        </button>
      </div>
    `).join('');
  } else if (tasksList) {
    tasksList.innerHTML = '<p style="color: #9ca3af; font-size: 13px; text-align: center; padding: 16px;">No hay tareas pendientes</p>';
  }
}

// Show notification
function showNotification(message, type = 'success') {
  // Simple notification - you can enhance this
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    background: ${type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 99999;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Close modal on ESC key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeTaskModal();
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  updateTasksDisplay();
});
