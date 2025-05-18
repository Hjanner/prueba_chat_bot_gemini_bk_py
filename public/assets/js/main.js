const sendButton = document.querySelector('#send-button');
const inputChat = document.querySelector('#chat-input');            //selecciono el input
const messageContainer = document.querySelector('.chat-messages');         //selecciono el contenedor del chat
const typingIndicator = document.querySelector('.typing-indicator'); // Selecciono el indicador de escritura
const userID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);


const sendMessage = async () => {
    //tomar el valor del iput, pregunta del usuario
    const userMessage = inputChat.value.trim();

    if(!userMessage) return false;        //sale de la ejecucion de esta funcion 

    //meter el mensaje del usuario en la caja de mensajes
    messageContainer.innerHTML += `<div class="message user-message">${userMessage}</div>`;
    //vaciar el input
    inputChat.value = '';

    // Mostrar el indicador de escritura
    typingIndicator.classList.add('active');

    // Espera un ciclo de evento para que el DOM se actualice
    setTimeout(async () => {
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
            
            messageContainer.innerHTML += `<div class="message bot-message">${data.reply}</div>`;
            messageContainer.scrollTop = messageContainer.scrollHeight;

        } catch (error) {
            console.log("Error: ", error );   
        } finally {
            // Ocultar el indicador de escritura
            typingIndicator.classList.remove('active');
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }, 10);
}

sendButton.addEventListener('click', sendMessage);
inputChat.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});
