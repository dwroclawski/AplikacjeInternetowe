document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const searchInput = document.getElementById('searchInput');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    renderTasks(tasks);

    addTaskBtn.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const dueDate = taskDate.value;

        if (taskText.length < 3 || taskText.length > 255) {
            alert('Invalid input: task must be between 3 and 255 characters long');
            return;
        }

        if (dueDate && new Date(dueDate) <= new Date()) {
            alert('Invalid input: due date must be in the future');
            return;
        }

        const task = {
            text: taskText,
            date: dueDate || null,
            id: Date.now(),
            completed: false
        };

        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks(tasks);

        taskInput.value = '';
        taskDate.value = '';
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        if (query.length >= 2) {
            const filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(query));
            renderTasks(filteredTasks, query);
        } else {
            renderTasks(tasks);
        }
    });

    function renderTasks(tasksToRender, highlight = '') {
        taskList.innerHTML = '';
    
        tasksToRender.forEach(task => {
            const listItem = document.createElement('li');
            listItem.setAttribute('data-id', task.id);
    
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => {
                task.completed = checkbox.checked;
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks(tasks); 
            });
    
            const taskText = document.createElement('span');
            taskText.classList.add('task-text');
            if (task.completed) {
                taskText.classList.add('completed');
            }
            taskText.innerHTML = highlight
                ? task.text.replace(new RegExp(`(${highlight})`, 'gi'), '<span class="highlight">$1</span>')
                : task.text;
            taskText.addEventListener('click', () => editTask(task.id, taskText));
    
            const taskDate = document.createElement('span');
            taskDate.classList.add('task-date');
            if (task.completed) {
                taskDate.classList.add('completed');
            }
            taskDate.textContent = task.date ? `(Due: ${task.date})` : 'Due: Not set';
            taskDate.addEventListener('click', () => editTaskDate(task.id, taskDate));
    
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = 'Delete';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
            listItem.appendChild(checkbox);
            listItem.appendChild(taskText);
            listItem.appendChild(taskDate);
            listItem.appendChild(deleteBtn);
    
            taskList.appendChild(listItem);
        });
    }

    function editTask(taskId, taskTextElement) {
        const task = tasks.find(task => task.id === taskId);
        const input = document.createElement('input');
        input.type = 'text';
        input.value = task.text;
        input.classList.add('edit-input');
    
        input.style.width = `${taskTextElement.offsetWidth}px`;
    
        taskTextElement.replaceWith(input);
        input.focus();
    
        input.addEventListener('blur', () => {
            task.text = input.value.trim();
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks(tasks);
        });
    
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                task.text = input.value.trim();
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks(tasks);
            }
        });
    }
    function editTaskDate(taskId, taskDateElement) {
        const task = tasks.find(task => task.id === taskId);
        const input = document.createElement('input');
        input.type = 'datetime-local';
        input.value = task.date ? new Date(task.date).toISOString().slice(0, 16) : '';
        input.classList.add('edit-input');
    
        input.style.width = `${taskDateElement.offsetWidth}px`;
    
        taskDateElement.replaceWith(input);
        input.focus();
    
        input.addEventListener('blur', () => {
            task.date = input.value || null;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks(tasks);
        });
    
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                task.date = input.value || null;
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks(tasks);
            }
        });
    }
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks(tasks);
    }
});