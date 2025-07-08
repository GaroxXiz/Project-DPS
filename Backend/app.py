from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)

# Correct CORS configuration for Docker Compose setup
# Allow requests from the 'frontend' service running on port 80
# and also allow localhost for direct local testing (if needed outside Docker Compose)
# Note: In a production environment, you would specify the exact domain
CORS(app, resources={r"/*": {"origins": ["http://frontend", "http://localhost", "http://127.0.0.1"]}})
# IMPORTANT: If your frontend is accessed from http://localhost:80, you might also need "http://localhost"
# because the browser sometimes defaults port 80 away.
# Let's try to explicitly allow http://localhost:80 as well to be safe:
# CORS(app, resources={r"/*": {"origins": ["http://frontend", "http://localhost:80", "http://localhost", "http://127.0.0.1"]}})


# Define the path to the todo.txt file relative to the app.py location
TODO_FILE = 'todo.txt'

@app.route('/todos', methods=['GET'])
def get_todos():
    try:
        with open(TODO_FILE, 'r') as f:
            todos = []
            for line in f.readlines():
                line = line.strip()
                if line:
                    parts = line.split(',', 1)
                    if len(parts) == 2:
                        task_text = parts[0]
                        completed_status = parts[1].lower() == 'true'
                        todos.append({'text': task_text, 'completed': completed_status})
                    else:
                        todos.append({'text': line, 'completed': False})
        return jsonify(todos)
    except FileNotFoundError:
        return jsonify([])
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/todos', methods=['POST'])
def add_todo():
    data = request.get_json()
    task_text = data.get('text', '').strip()
    completed = data.get('completed', False)

    if task_text:
        with open(TODO_FILE, 'a') as f:
            f.write(f"{task_text},{'true' if completed else 'false'}\n")
        return jsonify({'message': 'Task added', 'task': {'text': task_text, 'completed': completed}}), 201
    return jsonify({'error': 'Task text is empty'}), 400

@app.route('/todos/<task_text>', methods=['PUT'])
def update_todo(task_text):
    data = request.get_json()
    new_text = data.get('text', '').strip() if data.get('text') is not None else None
    new_completed = data.get('completed')

    if not task_text:
        return jsonify({'error': 'Original task text is empty'}), 400

    try:
        with open(TODO_FILE, 'r') as f:
            lines = f.readlines()

        found = False
        updated_lines = []
        for line in lines:
            line_stripped = line.strip()
            line_parts = line_stripped.split(',', 1)
            current_task_text = line_parts[0]
            current_completed = line_parts[1].lower() == 'true' if len(line_parts) > 1 else False

            if current_task_text == task_text:
                text_to_write = new_text if new_text is not None else current_task_text
                completed_to_write = new_completed if new_completed is not None else current_completed
                updated_lines.append(f"{text_to_write},{'true' if completed_to_write else 'false'}\n")
                found = True
            else:
                updated_lines.append(line)

        if not found:
            return jsonify({'error': 'Task not found'}), 404

        with open(TODO_FILE, 'w') as f:
            f.writelines(updated_lines)

        return jsonify({'message': 'Task updated'}), 200
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/todos/<task_text>', methods=['DELETE'])
def delete_todo(task_text):
    if not task_text:
        return jsonify({'error': 'Task text to delete is empty'}), 400

    try:
        with open(TODO_FILE, 'r') as f:
            lines = f.readlines()

        found = False
        with open(TODO_FILE, 'w') as f:
            for line in lines:
                line_stripped = line.strip()
                line_parts = line_stripped.split(',', 1)
                current_task_text = line_parts[0]

                if current_task_text != task_text:
                    f.write(line)
                else:
                    found = True

        if not found:
            return jsonify({'error': 'Task not found'}), 404

        return jsonify({'message': 'Task removed'}), 200
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    if not os.path.exists(TODO_FILE):
        with open(TODO_FILE, 'w') as f:
            pass
    app.run(debug=True, host='0.0.0.0', port=5000)