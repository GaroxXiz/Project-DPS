const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

// Simpan todos ke localStorage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Tampilkan semua tugas
function renderTodos() {
  list.innerHTML = "";
  const filtered = todos.filter((task) => {
    if (currentFilter === "completed") return task.completed;
    if (currentFilter === "incomplete") return !task.completed;
    return true;
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
      const realIndex = todos.indexOf(task);
      todos[realIndex].completed = !todos[realIndex].completed;
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
          const realIndex = todos.indexOf(task);
          todos[realIndex].text = newText;
          saveTodos();
        }
        renderTodos();
      };
    };

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Delete";
    btnDelete.onclick = () => {
      const realIndex = todos.indexOf(task);
      todos.splice(realIndex, 1);
      saveTodos();
      renderTodos();
    };

    li.appendChild(span);
    li.appendChild(btnEdit);
    li.appendChild(btnDone);
    li.appendChild(btnDelete);
    list.appendChild(li);
  });
}

// Filter tampilan
function setFilter(filter) {
  currentFilter = filter;
  renderTodos();
}

// Submit form untuk tambah tugas
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const taskText = input.value.trim();
  if (!taskText) return;

  todos.push({ text: taskText, completed: false });
  saveTodos();
  renderTodos();
  input.value = "";
});

// Render saat pertama kali dibuka
renderTodos();
