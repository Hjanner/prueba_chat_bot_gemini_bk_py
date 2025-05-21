const sendButton = document.querySelector('#send-button');
const inputChat = document.querySelector('#chat-input');            //selecciono el input
const messageContainer = document.querySelector('.chat-messages');         //selecciono el contenedor del chat
const userID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);


// Variable global para almacenar la referencia al indicador de escritura actual
let currentTypingIndicator = null;

function showTypingIndicator() {
    // Si ya existe un indicador, lo removemos antes de crear uno nuevo para evitar duplicados
    if (currentTypingIndicator && messageContainer.contains(currentTypingIndicator)) {
        currentTypingIndicator.remove();
    }

    const typingIndicatorDiv = document.createElement('div');
    // Le añadimos la clase 'typing-indicator' para los estilos de animación
    // Y la clase 'bot-message' para que se vea como una burbuja de chat del bot
    typingIndicatorDiv.classList.add('typing-indicator'); 
    typingIndicatorDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;

    // Añade el indicador al final del contenedor de mensajes
    messageContainer.appendChild(typingIndicatorDiv);

    // Usa un pequeño setTimeout para asegurar que el elemento está en el DOM
    // antes de añadir la clase 'active', lo que permite que la transición CSS funcione.
    setTimeout(() => {
        typingIndicatorDiv.classList.add('active');
        // Desplaza el chat hacia abajo para que el indicador sea visible
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }, 50); // Un pequeño retraso (ej. 50ms) es suficiente

    // Almacena la referencia para poder ocultarlo más tarde
    currentTypingIndicator = typingIndicatorDiv;
}

function hideTypingIndicator() {
    if (currentTypingIndicator && messageContainer.contains(currentTypingIndicator)) {
        currentTypingIndicator.classList.remove('active'); // Inicia la transición de fade-out

        // Después de que la transición CSS termine (0.3s), elimina el elemento del DOM
        setTimeout(() => {
            if (currentTypingIndicator && messageContainer.contains(currentTypingIndicator)) {
                currentTypingIndicator.remove();
            }
            // Asegura que el chat se desplace al final después de que el indicador desaparezca
            messageContainer.scrollTop = messageContainer.scrollHeight;
            currentTypingIndicator = null; // Limpia la referencia
        }, 300); // Coincide con la duración de la transición en CSS (0.3s)
    }
}

//  ---  manejo de mensajes del front
function addMessageUserChat(userMessage) {
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message');
    userMessageDiv.textContent = userMessage;
    messageContainer.appendChild(userMessageDiv);
    inputChat.value = ''; // Limpiar el input
    messageContainer.scrollTop = messageContainer.scrollHeight; // Desplazar para ver el mensaje del usuario

}

function errorMessageChat(){
    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.classList.add('message', 'bot-message', 'error-message');
    errorMessageDiv.textContent = "Lo siento, hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.";
    messageContainer.appendChild(errorMessageDiv);
}

function addBotResponseChat(reply) {
    const botMessageDiv = document.createElement('div');
    botMessageDiv.classList.add('message', 'bot-message');
    botMessageDiv.innerHTML = `${reply}`;
    messageContainer.appendChild(botMessageDiv);
}

// Nueva función para enviar peticion a Python
const sendFetchAI = async (userMessage) => {
    try {
        const response = await fetch('/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userID,
                message: userMessage
             })
        });

        if (!response.ok) { // Verifica si la respuesta HTTP fue exitosa (código 200-299)
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();                 //tomo data devuelta del bot
        console.log('Respuesta de Python:', data);

        return data.reply;                      //retorno el mero mensaje de respesta
    } catch (error) {
        console.error('Error al enviar mensaje a Python:', error);
    }
};

const sendMessage = async () => {
    const userMessage = inputChat.value.trim();                         //tomar el valor del iput, pregunta del usuario
    
    if(!userMessage) return false;                      //sale de la ejecucion de esta funcion 

    addMessageUserChat(userMessage);                    // 1. Añadir el mensaje del usuario al chat
    
    showTypingIndicator();                              // 2. Mostrar el indicador de escritura del bot

    // Espera un ciclo de evento para que el DOM se actualice
    try {
        const reply = await sendFetchAI(userMessage);                   //peticion al backend para que responda la ia
        addBotResponseChat(reply);                //3. Añadir la respuesta del bot al chat

    } catch (error) {
        console.log("Error: ", error );   
        errorMessageChat();
    } finally {
        hideTypingIndicator();
        messageContainer.scrollTop = messageContainer.scrollHeight;                 //chat se desplace al final después de añadir el mensaje del bot
    }
}

sendButton.addEventListener('click', sendMessage);
inputChat.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Previene el salto de línea en el input
        sendMessage();
    }
});

//Desplazar al final al cargar la página (para el mensaje de bienvenida)
window.addEventListener('load', () => {
    messageContainer.scrollTop = messageContainer.scrollHeight;
});
