document.addEventListener("DOMContentLoaded", loadTasks);
const API_URL = "http://localhost:4000";

function saveToLocalStorage(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getFromLocalStorage() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}

async function addTask() {
    const input = document.getElementById("todo-input");
    const deadlineInput = document.getElementById("deadline-input");
    const taskText = input.value.trim();
    const deadline = deadlineInput?.value || "No deadline";

    if (taskText === "") return;

    const task = { id: Date.now(), title: taskText, deadline, status: "pending" };
    const tasks = getFromLocalStorage();
    tasks.push(task);
    saveToLocalStorage(tasks);

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });

        if (!response.ok) throw new Error("Server error");
    } catch (error) {
        console.warn("⚠️ Server is offline, saving task locally.");
    }

    document.getElementById("todo-list").appendChild(createTaskElement(task));
    input.value = "";
    if (deadlineInput) deadlineInput.value = "";
}

function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = task.id;
    if (task.status === "completed") li.classList.add("done");

    const span = document.createElement("span");
    span.innerText = `${task.title} (Deadline: ${task.deadline})`;
    span.onclick = () => toggleDone(task.id, li);

    const doneBtn = document.createElement("button");
    doneBtn.innerText = "✔";
    doneBtn.classList.add("mark-done");
    doneBtn.onclick = () => toggleDone(task.id, li);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "✖";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = () => deleteTask(task.id, li);

    li.appendChild(span);
    li.appendChild(doneBtn);
    li.appendChild(deleteBtn);
    return li;
}

async function toggleDone(taskId, li) {
    let tasks = getFromLocalStorage();
    const task = tasks.find(t => t.id == taskId);
    if (task) {
        task.status = task.status === "completed" ? "pending" : "completed";
        saveToLocalStorage(tasks);
    }

    try {
        await fetch(`${API_URL}/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: task.status }),
        });
    } catch (error) {
        console.warn("⚠️ Server is offline, updating task locally.");
    }

    li.classList.toggle("done");
}

async function deleteTask(taskId, li) {
    let tasks = getFromLocalStorage();
    tasks = tasks.filter(task => task.id != taskId);
    saveToLocalStorage(tasks);

    try {
        await fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" });
    } catch (error) {
        console.warn("⚠️ Server is offline, deleting task locally.");
    }

    li.remove();
}

async function loadTasks() {
    let tasks = [];

    try {
        const response = await fetch(`${API_URL}/tasks/1`);
        if (!response.ok) throw new Error("Server error");
        tasks = await response.json();
    } catch (error) {
        console.warn("⚠️ Server is offline, loading tasks from Local Storage.");
        tasks = getFromLocalStorage();
    }

    const list = document.getElementById("todo-list");
    list.innerHTML = "";
    tasks.forEach(task => list.appendChild(createTaskElement(task)));
}
