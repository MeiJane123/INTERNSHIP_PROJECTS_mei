document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 JavaScript Loaded!");
    fetchTasks();
    setupEventListeners();
});

const apiBaseUrl = "http://localhost:5000/tasks";

function setupEventListeners() {
    document.querySelectorAll(".menu li").forEach(item => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".menu li").forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            const category = item.getAttribute("data-category");
            filterTasks(category);
        });
    });
    document.getElementById("searchInput").addEventListener("input", (e) => {
        const filter = e.target.value.toLowerCase();
        document.querySelectorAll(".task-board ul li").forEach(task => {
            task.style.display = task.textContent.toLowerCase().includes(filter) ? "block" : "none";
        });
    });
    document.getElementById("openModalBtn").addEventListener("click", openModal);
    document.getElementById("closeModalBtn").addEventListener("click", closeModal);
    window.addEventListener("click", (e) => {
        if (e.target === document.getElementById("taskModal")) closeModal();
    });
}
function openModal() {
    document.getElementById("taskModal").style.display = "flex";
    resetModalFields();
}
function closeModal() {
    document.getElementById("taskModal").style.display = "none";
}
function resetModalFields() {
    const fields = ["task-name", "task-date", "start-time", "end-time", "priority", "category", "description"];
    fields.forEach(id => document.getElementById(id).value = "");
}
async function fetchTasks() {
    try {
        const response = await fetch(apiBaseUrl);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error("❌ Error fetching tasks:", error);
    }
}
function filterTasks(category) {
    const allTasks = document.querySelectorAll(".task-item");
    allTasks.forEach(task => {
        const taskCategory = task.getAttribute("data-category");
        task.style.display = category === "All" || taskCategory === category ? "flex" : "none";
    });
}
function displayTasks(tasks) {
    const lists = {
        "pending": document.getElementById("todo-list"),
        "in-progress": document.getElementById("in-progress-list"),
        "completed": document.getElementById("done-list")
    };
    Object.values(lists).forEach(list => list.innerHTML = "");

    let total = 0, completed = 0, pending = 0;
    
    tasks.forEach(task => {
        total++;
        if (task.status === "completed") completed++;
        else pending++;

        const listItem = document.createElement("li");
        listItem.classList.add("task-item");
        listItem.setAttribute("data-category", task.category);
        listItem.innerHTML = `
            <div class="task-card">
                <h3 class="task-title">${task.title}</h3>
                <p class="task-details">
                    <span><strong><i class="fa-solid fa-calendar-week"></i>:</strong> ${formatDate(task.due_date)}</span>
                </p>  
                    <p> <span><strong><i class="fa-solid fa-check"></i>:</strong> ${capitalizeFirstLetter(task.priority)}</span></p>
                    <p> <span><strong><i class="fa-solid fa-list"></i>:</strong> ${capitalizeFirstLetter(task.category)}</span></p>
                    <p> <span><strong><i class="fa-solid fa-pen-to-square"></i>:</strong> ${capitalizeFirstLetter(task.description)}</span></p>   
                </p>
                <div class="task-actions">
                    <button class="edit-btn" onclick="editTask(${task.id})">
                        <i class="fa-solid fa-file-pen"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                    ${task.status === "pending" ? `
                        <button class="start-btn" onclick="updateTaskStatus(${task.id}, 'in-progress')">
                            <i class="fa-solid fa-play"></i>
                        </button>
                    ` : ""}
                    ${task.status === "in-progress" ? `
                        <button class="complete-btn" onclick="updateTaskStatus(${task.id}, 'completed')">
                            <i class="fa-solid fa-circle-check"></i>
                        </button>
                    ` : ""}
                </div>
            </div>
        `;
        lists[task.status]?.appendChild(listItem);
    });

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
}
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function updateTaskStatus(taskId, newStatus) {
    tasks = tasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task);
    displayTasks(tasks);
}
async function saveTask() {
    const taskData = {
        title: document.getElementById("task-name").value.trim(),
        due_date: document.getElementById("task-date").value,
        start_time: document.getElementById("start-time").value,
        end_time: document.getElementById("end-time").value,
        priority: document.getElementById("priority").value,
        category: document.getElementById("category").value,
        description: document.getElementById("description").value.trim(),
        status: "pending"
    };
    try {
        const response = await fetch(apiBaseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskData)
        });
        if (!response.ok) throw new Error("Failed to save task");
        alert("✅ Task added successfully!");
        closeModal();
        fetchTasks();
    } catch (error) {
        console.error("❌ Error adding task:", error);
    }
}
async function editTask(taskId) {
    const newTitle = prompt("Enter new task title:");
    if (!newTitle) return;
    try {
        const response = await fetch(`${apiBaseUrl}/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle })
        });
        if (!response.ok) throw new Error("Failed to edit task");
        alert("✅ Task updated successfully!");
        fetchTasks();
    } catch (error) {
        console.error("❌ Error editing task:", error);
    }
}
async function deleteTask(taskId) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
        const response = await fetch(`${apiBaseUrl}/${taskId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) throw new Error("Failed to delete task");
        alert("🗑 Task deleted successfully!");
        fetchTasks(); 
    } catch (error) {
        console.error("❌ Error deleting task:", error);
    }
}
async function updateTaskStatus(taskId, newStatus) {
    try {
        const response = await fetch(`${apiBaseUrl}/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error(`Failed to update task to ${newStatus}`);

        alert(`✅ Task marked as ${newStatus}!`);
        fetchTasks();
    } catch (error) {
        console.error(`❌ Error updating task:`, error);
    }
}
function updateProgress(total, completed, pending) {
    let completedPercent = total > 0 ? (completed / total) * 100 : 0;
    let pendingPercent = total > 0 ? (pending / total) * 100 : 0;

    document.getElementById("progressCompleted").style.width = completedPercent + "%";
    document.getElementById("progressPending").style.width = pendingPercent + "%";
}
function updateTaskSummary(total, completed, pending) {
    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    updateProgress(total, completed, pending);
}
updateTaskSummary(20, 12, 8);
