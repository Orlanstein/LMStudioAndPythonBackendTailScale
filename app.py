from flask import Flask, render_template, request, jsonify
from openai import OpenAI

app = Flask(__name__)

client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")

history = [
    {"role": "system", "content": "You are an intelligent assistant. You always provide well-reasoned answers that are both correct and helpful."},
]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json['message']
    history.append({"role": "user", "content": user_message})

    completion = client.chat.completions.create(
        model="lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF",
        messages=history,
        temperature=0.7,
        stream=False,
    )

    assistant_message = completion.choices[0].message.content
    history.append({"role": "assistant", "content": assistant_message})

    return jsonify({'message': assistant_message})

if __name__ == '__main__':
    app.run(host="100.124.129.31", port=5000)

