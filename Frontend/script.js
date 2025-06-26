const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

form.addEventListener('submit', function (e) {
    e.preventDefault();

    const taskText = input.value.trim();
    if (!taskText) return;

    const li = document.createElement('li');
    li.innerHTML = `${taskText} <button onclick="this.parentElement.remove()">Done</button>`;
    list.appendChild(li);

    input.value = '';
});
