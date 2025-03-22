document.getElementById('addTaskBtn').addEventListener('click', function() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    if (taskText) {
        const taskList = document.getElementById('taskList');
        const li = document.createElement('li');
        li.classList.add('task-item');
        li.innerHTML = `<span>${taskText}</span>`;

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', function() {
            const newTask = prompt('Edit your task:', taskText);
            if (newTask) {
                li.querySelector('span').textContent = newTask;
                updateLocalStorage();
            }
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', function() {
            li.classList.add('fade-out');
            setTimeout(() => {
                taskList.removeChild(li);
                updateLocalStorage();
            }, 300);
        });

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
        taskInput.value = '';
        updateLocalStorage();
    }
});

function updateLocalStorage() {
    const tasks = [];
    document.querySelectorAll('.task-item span').forEach(task => {
        tasks.push(task.textContent);
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskList = document.getElementById('taskList');
    tasks.forEach(taskText => {
        const li = document.createElement('li');
        li.classList.add('task-item');
        li.innerHTML = `<span>${taskText}</span>`;

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', function() {
            const newTask = prompt('Edit your task:', taskText);
            if (newTask) {
                li.querySelector('span').textContent = newTask;
                updateLocalStorage();
            }
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', function() {
            li.classList.add('fade-out');
            setTimeout(() => {
                taskList.removeChild(li);
                updateLocalStorage();
            }, 300);
        });

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', loadTasks);
