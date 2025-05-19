const sendButton = document.querySelector('#send-button');
const inputChat = document.querySelector('#chat-input');            //selecciono el input
const messageContainer = document.querySelector('.chat-messages');         //selecciono el contenedor del chat
const userID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);


// --- Funciones para el indicador de escritura ---

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


const sendMessage = async () => {
    //tomar el valor del iput, pregunta del usuario
    const userMessage = inputChat.value.trim();

    if(!userMessage) return false;        //sale de la ejecucion de esta funcion 

    // //meter el mensaje del usuario en la caja de mensajes
    // messageContainer.innerHTML += `<div class="message user-message">${userMessage}</div>`;
    // //vaciar el input
    // inputChat.value = '';

        // 1. Añadir el mensaje del usuario al chat
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message');
    userMessageDiv.textContent = userMessage;
    messageContainer.appendChild(userMessageDiv);
    inputChat.value = ''; // Limpiar el input
    messageContainer.scrollTop = messageContainer.scrollHeight; // Desplazar para ver el mensaje del usuario

    // 2. Mostrar el indicador de escritura del bot
    showTypingIndicator();


    // Espera un ciclo de evento para que el DOM se actualice
    try {
        //peticion al backend para que responda la ia
        const reponse = await fetch('/api/chatbot', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},  //indica el formato del contenido de la cabecera, a json
            body: JSON.stringify({
                userID,
                message: userMessage
            })      //envia el mensaje del usuario
        });

        //incrustar la respuesta en la caja de mensajes del chat
        const data = await reponse.json();          //convertir la repsuesta en un objeto json
        
    //3. Añadir la respuesta del bot al chat
        const botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('message', 'bot-message');
        botMessageDiv.innerHTML = `${data.reply}`;
        messageContainer.appendChild(botMessageDiv);

    } catch (error) {
        console.log("Error: ", error );   
        const errorMessageDiv = document.createElement('div');
        errorMessageDiv.classList.add('message', 'bot-message', 'error-message');
        errorMessageDiv.textContent = "Lo siento, hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.";
        messageContainer.appendChild(errorMessageDiv);

    } finally {
        hideTypingIndicator();
        // Asegúrate de que el chat se desplace al final después de añadir el mensaje del bot
        messageContainer.scrollTop = messageContainer.scrollHeight;
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
