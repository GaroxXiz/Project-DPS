const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

// Determine API_BASE_URL based on environment
// When running inside Docker Compose, 'backend' is the service name.
// When developing locally, it's localhost:5000.
const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000" // For local development outside Docker Compose
    : "http://backend:5000";  // For inside Docker Compose network

let todos = [];
let currentFilter = "all";

// --- API Interaction Functions ---

async function fetchTodos() {
    try {
        const response = await fetch(`${API_BASE_URL}/todos`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        todos = await response.json();
        renderTodos();
    } catch (error) {
        console.error("Error fetching todos:", error);
        alert("Failed to load tasks. Please check the server connection.");
    }
}

async function addTodoToBackend(taskText) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: taskText, completed: false }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        await fetchTodos();
    } catch (error) {
        console.error("Error adding todo:", error);
        alert("Failed to add task.");
    }
}

async function updateTodoOnBackend(originalText, newText, completedStatus) {
    try {
        // encodeURIComponent ensures special characters in taskText are handled correctly in the URL
        const response = await fetch(`${API_BASE_URL}/todos/${encodeURIComponent(originalText)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: newText, completed: completedStatus }),
        });
        if (!response.ok) {
            // Handle specific error codes if needed
            if (response.status === 404) {
                alert("Task not found on server. It might have been deleted.");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        await fetchTodos();
    } catch (error) {
        console.error("Error updating todo:", error);
        alert("Failed to update task.");
    }
}

async function deleteTodoFromBackend(taskText) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${encodeURIComponent(taskText)}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            if (response.status === 404) {
                alert("Task not found on server. It might have been deleted.");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        await fetchTodos();
    } catch (error) {
        console.error("Error deleting todo:", error);
        alert("Failed to delete task.");
    }
}

// --- UI Rendering Functions ---

function renderTodos() {
    list.innerHTML = "";
    const filtered = todos.filter((task) => {
        if (currentFilter === "completed") return task.completed;
        if (currentFilter === "incomplete") return !task.completed;
        return true;
    });

    filtered.forEach((task) => {
        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = task.text;
        if (task.completed) {
            span.style.textDecoration = "line-through";
            span.style.color = "#999";
        }

        const btnDone = document.createElement("button");
        btnDone.textContent = task.completed ? "Undo" : "Done";
        btnDone.onclick = async () => {
            // Note: When updating completion, the text remains the same.
            await updateTodoOnBackend(task.text, task.text, !task.completed);
        };

        const btnEdit = document.createElement("button");
        btnEdit.textContent = "Edit";
        btnEdit.onclick = () => {
            const inputEdit = document.createElement("input");
            inputEdit.type = "text";
            inputEdit.value = task.text;
            inputEdit.className = "edit-input";

            const btnSave = document.createElement("button");
            btnSave.textContent = "Save";

            // Create a cancel button
            const btnCancel = document.createElement("button");
            btnCancel.textContent = "Cancel";
            btnCancel.onclick = () => renderTodos(); // Re-render to revert

            li.innerHTML = "";
            li.appendChild(inputEdit);
            li.appendChild(btnSave);
            li.appendChild(btnCancel); // Add cancel button
            inputEdit.focus();

            btnSave.onclick = async () => {
                const newText = inputEdit.value.trim();
                if (newText && newText !== task.text) {
                    await updateTodoOnBackend(task.text, newText, task.completed);
                } else {
                    renderTodos(); // If no change or empty, just re-render to original state
                }
            };
        };

        const btnDelete = document.createElement("button");
        btnDelete.textContent = "Delete";
        btnDelete.onclick = async () => {
            await deleteTodoFromBackend(task.text);
        };

        li.appendChild(span);
        li.appendChild(btnEdit);
        li.appendChild(btnDone);
        li.appendChild(btnDelete);
        list.appendChild(li);
    });
}

function setFilter(filter) {
    currentFilter = filter;
    renderTodos();
}

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const taskText = input.value.trim();
    if (!taskText) return;

    await addTodoToBackend(taskText);
    input.value = "";
});

// Fetch todos when the page first loads
document.addEventListener("DOMContentLoaded", fetchTodos);