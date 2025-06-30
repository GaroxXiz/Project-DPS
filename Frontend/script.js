const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Fungsi untuk menyimpan ke localStorage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Fungsi untuk menambahkan task ke DOM
function renderTodo(taskText, index) {
  const li = document.createElement("li");
  li.innerHTML = `
    ${taskText}
    <button onclick="removeTodo(${index})">Done</button>
  `;
  list.appendChild(li);
}

// Fungsi untuk menghapus todo
function removeTodo(index) {
  todos.splice(index, 1);
  saveTodos();
  renderTodos(); // render ulang setelah penghapusan
}

// Fungsi untuk render semua todos dari localStorage
function renderTodos() {
  list.innerHTML = ""; // clear dulu
  todos.forEach((task, index) => {
    renderTodo(task, index);
  });
}

// Saat form disubmit
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const taskText = input.value.trim();
  if (!taskText) return;

  todos.push(taskText);
  saveTodos();
  renderTodos();

  input.value = "";
});

// Jalankan saat pertama kali halaman dibuka
renderTodos();
