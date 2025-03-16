document.addEventListener("DOMContentLoaded", loadTasks);

const API_URL = process.env.API_URL || "http://localhost:8080";

async function addTask() {
    const input = document.getElementById("todo-input");
    const deadlineInput = document.getElementById("deadline-input");
    const taskText = input.value.trim();
    const deadline = deadlineInput.value;
    if (taskText === "") return;

    const task = { user_id: 1, title: taskText, deadline }; 
    const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });
    const newTask = await response.json();

    const li = createTaskElement(newTask);
    document.getElementById("todo-list").appendChild(li);
    input.value = "";
    deadlineInput.value = "";
}

function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "todo-item";
    if (task.status === "completed") {
        li.classList.add("done");
    }

    const span = document.createElement("span");
    span.innerText = `${task.title} (Deadline: ${task.deadline || "No deadline"})`;
    span.onclick = () => toggleDone(task.id);

    const doneBtn = document.createElement("button");
    doneBtn.innerText = "✔";
    doneBtn.classList.add("mark-done");
    doneBtn.onclick = () => toggleDone(task.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "✖";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = () => deleteTask(task.id, li);

    li.appendChild(span);
    li.appendChild(doneBtn);
    li.appendChild(deleteBtn);
    return li;
}

async function toggleDone(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" })
    });
    const updatedTask = await response.json();
    location.reload();
}

async function deleteTask(taskId, li) {
    await fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" });
    li.remove();
}

async function loadTasks() {
    const response = await fetch(`${API_URL}/tasks/1`);
    const tasks = await response.json();
    const list = document.getElementById("todo-list");
    list.innerHTML = "";
    tasks.forEach(task => {
        const li = createTaskElement(task);
        list.appendChild(li);
    });
}
