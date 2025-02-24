from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)
CORS(app)

# Initialize OpenAI client
client = OpenAI(base_url="http://localhost:1234/v1", api_key="not-needed")

# Conversation history
conversation_history = []

def initialize_history():
    global conversation_history
    conversation_history = [
        {"role": "system", "content": "You are an intelligent assistant. You always provide well-reasoned answers that are both correct and helpful."},
    ]

initialize_history()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message')
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Append user message to history
        conversation_history.append({"role": "user", "content": user_message})

        # Get assistant's response
        completion = client.chat.completions.create(
            model="lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF",
            messages=conversation_history,
            temperature=0.7,
            stream=False,
        )

        # Extract and store assistant message
        assistant_message = completion.choices[0].message.content
        conversation_history.append({"role": "assistant", "content": assistant_message})

        # Prevent history from growing indefinitely
        if len(conversation_history) > 20:
            initialize_history()

        return jsonify({'message': assistant_message})

    except Exception as e:
        app.logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': 'An error occurred while processing your request'}), 500

if __name__ == '__main__':
    app.run(host="100.124.129.31", port=5000, debug=True)