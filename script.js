// Initialize tasks array from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentCategory = 'all';

// Category icons
const categoryIcons = {
  general: '📋',
  work: '💼',
  school: '🎓'
};

// Load tasks and theme on page load
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  renderTasks();
  updateStats();
  
  // Add Enter key listener
  document.getElementById('taskInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  });
});

// Theme Toggle
function toggleTheme() {
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  
  body.classList.toggle('light-mode');
  
  // Update icon
  if (body.classList.contains('light-mode')) {
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    localStorage.setItem('theme', 'light');
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', 'dark');
  }
}

// Load Theme
function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  const themeToggle = document.getElementById('themeToggle');
  
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

// Add new task
function addTask() {
  const input = document.getElementById('taskInput');
  const categorySelect = document.getElementById('categorySelect');
  const taskText = input.value.trim();
  const category = categorySelect.value;

  if (taskText === '') {
    alert('Please enter a task!');
    return;
  }

  const task = {
    id: Date.now(),
    text: taskText,
    category: category,
    completed: false,
    createdAt: new Date().toLocaleString()
  };

  tasks.unshift(task);
  saveTasks();
  renderTasks();
  updateStats();
  input.value = '';
  input.focus();
}

// Toggle task completion
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateStats();
  }
}

// Delete task
function deleteTask(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
  }
}

// Edit task
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    const newText = prompt('Edit task:', task.text);
    if (newText !== null && newText.trim() !== '') {
      task.text = newText.trim();
      saveTasks();
      renderTasks();
    }
  }
}

// Filter tasks by status
function filterTasks(filter) {
  currentFilter = filter;
  
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  renderTasks();
}

// Filter tasks by category
function filterByCategory(category) {
  currentCategory = category;
  
  // Update active category filter button
  document.querySelectorAll('.category-filter').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  renderTasks();
}

// Clear completed tasks
function clearCompleted() {
  const completedCount = tasks.filter(t => t.completed).length;
  
  if (completedCount === 0) {
    alert('No completed tasks to clear!');
    return;
  }

  if (confirm(`Delete ${completedCount} completed task(s)?`)) {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
    updateStats();
  }
}

// Render tasks
function renderTasks() {
  const taskList = document.getElementById('taskList');
  
  // Filter tasks based on current filters
  let filteredTasks = tasks;
  
  // Filter by status
  if (currentFilter === 'completed') {
    filteredTasks = filteredTasks.filter(t => t.completed);
  } else if (currentFilter === 'pending') {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  }
  
  // Filter by category
  if (currentCategory !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.category === currentCategory);
  }

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <p>${currentFilter === 'all' ? 'No tasks yet. Add one to get started!' : 
            currentFilter === 'completed' ? 'No completed tasks yet.' : 
            'All tasks completed! 🎉'}</p>
      </div>
    `;
    return;
  }

  taskList.innerHTML = filteredTasks.map(task => `
    <li class="task-item ${task.completed ? 'completed' : ''}">
      <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})">
        <i class="fas fa-check"></i>
      </div>
      <div class="task-content">
        <div class="task-text">
          <span class="task-category">${categoryIcons[task.category]} ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
          <span>${escapeHtml(task.text)}</span>
        </div>
        <div class="task-time">
          <i class="far fa-clock"></i> ${task.createdAt}
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn edit-btn" onclick="editTask(${task.id})" title="Edit task">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete-btn" onclick="deleteTask(${task.id})" title="Delete task">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </li>
  `).join('');
}

// Update statistics
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  document.getElementById('totalTasks').textContent = total;
  document.getElementById('completedTasks').textContent = completed;
  document.getElementById('pendingTasks').textContent = pending;
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
