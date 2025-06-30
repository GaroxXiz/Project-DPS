const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

// Fungsi untuk menyimpan ke localStorage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function renderTodos() {
  list.innerHTML = "";
  const filtered = todos.filter((task) => {
    if (currentFilter === "completed") return task.completed;
    if (currentFilter === "incomplete") return !task.completed;
    return true; // all
  });

  filtered.forEach((task, index) => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = task.text;
    if (task.completed) {
      span.style.textDecoration = "line-through";
      span.style.color = "#999";
    }

    const btnDone = document.createElement("button");
    btnDone.textContent = task.completed ? "Undo" : "Done";
    btnDone.onclick = () => {
      todos[index].completed = !todos[index].completed;
      saveTodos();
      renderTodos();
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

      li.innerHTML = "";
      li.appendChild(inputEdit);
      li.appendChild(btnSave);
      inputEdit.focus();

      btnSave.onclick = () => {
        const newText = inputEdit.value.trim();
        if (newText) {
          todos[index].text = newText;
          saveTodos();
        }
        renderTodos();
      };
    };

    li.appendChild(span);
    li.appendChild(btnEdit);
    li.appendChild(btnDone);
    list.appendChild(li);
  });
}

function setFilter(filter) {
  currentFilter = filter;
  renderTodos();
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const taskText = input.value.trim();
  if (!taskText) return;

  todos.push({ text: taskText, completed: false });
  saveTodos();
  renderTodos();

  input.value = "";
});

// Jalankan saat pertama kali halaman dibuka
renderTodos();
