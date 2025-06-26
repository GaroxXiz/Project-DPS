from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

TODO_FILE = 'todo.txt'

@app.route('/todos', methods=['GET'])
def get_todos():
    try:
        with open(TODO_FILE, 'r') as f:
            todos = [line.strip() for line in f.readlines()]
        return jsonify(todos)
    except FileNotFoundError:
        return jsonify([])

@app.route('/todos', methods=['POST'])
def add_todo():
    data = request.get_json()
    task = data.get('task', '').strip()
    if task:
        with open(TODO_FILE, 'a') as f:
            f.write(task + '\n')
        return jsonify({'message': 'Task added'}), 201
    return jsonify({'error': 'Task is empty'}), 400

@app.route('/todos', methods=['DELETE'])
def delete_todo():
    data = request.get_json()
    task = data.get('task', '').strip()
    if not task:
        return jsonify({'error': 'Task is empty'}), 400

    try:
        with open(TODO_FILE, 'r') as f:
            lines = f.readlines()
        with open(TODO_FILE, 'w') as f:
            for line in lines:
                if line.strip() != task:
                    f.write(line)
        return jsonify({'message': 'Task removed'})
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404
