function sendMessage() {
    let userInput = document.getElementById("user-input").value.trim();
    if (userInput === "") return;

    let chatBox = document.getElementById("chat-box");

    // Agregar mensaje del usuario
    let userMessageDiv = document.createElement("div");
    userMessageDiv.classList.add("message", "user-message");
    userMessageDiv.textContent = userInput;
    chatBox.appendChild(userMessageDiv);

    // Crear un contenedor para el mensaje del bot (vacío al inicio)
    let botMessageDiv = document.createElement("div");
    botMessageDiv.classList.add("message", "bot-message");
    chatBox.appendChild(botMessageDiv);

    // Mostrar indicador de carga
    let loadingDiv = document.createElement("div");
    loadingDiv.classList.add("message", "loading");
    loadingDiv.textContent = "Escribiendo...";
    chatBox.appendChild(loadingDiv);

    // Desplazamiento automático hacia abajo
    chatBox.scrollTop = chatBox.scrollHeight;

    // Enviar la petición al servidor Flask
    fetch("/chat", {
        method: "POST",
        body: JSON.stringify({ message: userInput }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error en la respuesta del servidor");
        }
        return response.json();
    })
    .then(data => {
        // Eliminar el indicador de carga
        chatBox.removeChild(loadingDiv);

        // Mostrar la respuesta del bot
        let botResponse = data.message;
        typeWriterEffect(botMessageDiv, botResponse);
    })
    .catch(error => {
        // Eliminar el indicador de carga
        chatBox.removeChild(loadingDiv);

        // Mostrar mensaje de error
        botMessageDiv.textContent = "❌ Error: No se pudo obtener una respuesta.";
        console.error("Error:", error);
    });

    document.getElementById("user-input").value = "";
}

// Función para efecto de escritura progresiva
function typeWriterEffect(element, text, index = 0) {
    if (index < text.length) {
        element.textContent += text[index];
        setTimeout(() => typeWriterEffect(element, text, index + 1), 30); // Velocidad de escritura (ajustable)
    }
}

// Permitir enviar mensaje con Enter
function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}