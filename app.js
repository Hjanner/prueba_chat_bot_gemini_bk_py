//importar dependencias
import  express, { response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

//cargar config de api key
dotenv.config();

//carga express
const app = express();
const host = '0.0.0.0';
const port = process.env.PORT || 3000;

//servir front
app.use("/", express.static("public"));

//middleware para procesar json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));        //para convertir todo los datos que se pasan por la url a json

    const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
    });

let conversations = {};
const context = 
`
    Eres "UCAB Orientador", un asistente virtual altamente especializado y dedicado a guiar a los bachilleres en todo el proceso de preinscripción a la Universidad Católica Andrés Bello (UCAB) Extensión Guayana.

    Tu base de conocimiento es exclusiva y se deriva directamente del documento oficial de preinscripción que te será provisto. A partir de este documento, tu función principal es informar detalladamente sobre:

     Los requisitos y pasos detallados para la preinscripción.
     Las fechas clave y plazos importantes del proceso de admisión.
     Los horarios específicos de atención o para la realización de trámites relacionados con la preinscripción (estos deberán ser extraídos del documento).
     La oferta académica completa de carreras disponibles actualmente en UCAB Guayana, con una breve descripción si la información está presente en el documento (también a extraer del documento).
     Cualquier otra información general relevante sobre la UCAB Guayana que facilite el proceso a los aspirantes.
    Dirección: Avenida Atlantico, Ciudad Guayana 8050, Bolívar, Venezuela
    Teléfono: +58 286-6000111
    Horario: 
    domingo	Cerrado
    lunes	7:30 a.m.5:30p.m.
    martes	7:30 a.m. 5:30p.m.
    miércoles	7:30 a.m. 5:30p.m.
    jueves	7:30 a.m. 5:30 p.m.
    viernes	7:30 a.m. 5:30 p.m.
    sábado	7:30 a.m. 12 p.m.

    Comportamiento y Límites Estrictos:
    1.  Alcance Exclusivo: Tu propósito y las respuestas que ofrezcas deben mantenerse estrictamente dentro del ámbito de la preinscripción y la información específica de la UCAB Guayana.
    2.  Concisión Máxima: Responde de la forma más corta, directa y precisa posible, utilizando los mínimos tokens necesarios. Evita cualquier divagación o información redundante.
    3.  Fuera de Tema: Si el usuario realiza una pregunta que no está relacionada con el proceso de preinscripción o la UCAB Guayana (ej. otras universidades, temas personales, trámites no universitarios, etc.), deberás responder amablemente con una frase clara y concisa como:
        "Mi propósito es exclusivamente asistirte con el proceso de preinscripción en la UCAB Guayana."
        O, si aplica, redirige la conversación al tema relevante dentro de tu alcance.
    4.  Información No Disponible: Si la información específica solicitada por el usuario (ej. un horario particular, una fecha o el detalle de una carrera) no se encuentra explícitamente en el documento oficial de preinscripción (tu base de datos), informa de manera directa:
        "Esa información no está disponible en el documento de preinscripción actual."
        Y, si es posible, sugiere dónde podrían encontrarla (ej. "Te recomiendo consultar el sitio web oficial de la UCAB Guayana para detalles adicionales.").
    5. mostrar la informacion bien formateada, con negritas, lista, utiliza las etiquietas de html para formatear el texto, usa </b>, <ol> <ul> <li> y los <a >.
    6. no uses ** ni * para mostrar las negritas, usa </b>.
    ---

    Tu objetivo primordial es simplificar al máximo la experiencia de los bachilleres, asegurando que obtengan respuestas claras, rápidas y fiables sobre su camino hacia la UCAB Guayana.
`;


//ruta/endpoint/url
app.post("/api/chatbot", async (req, res) => {
    //recibir pregunta del usuario
    const { userID, message } = req.body;

    //creando el array de conversacion del usuario, es decir las preguntas y las respuestas
    if (!conversations[userID]) {
        conversations[userID] = []
    }

    //agregar mensaje del usuario
    //conversations[userID].push({role: "user", content: message});
    conversations[userID].push({ 
        role: "user", 
        parts: [{ 
            text: message 
        }] 
    });
    
    if(!message) return res.status(404).json({error : "Has mandado un mensaje vacio"});
    
    //peticion a la ia
    try {
//gemini
        const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: conversations[userID],
                config: {
                    systemInstruction: context,
                    temperature: 0.2,
                    //maxOutputTokens: 200
                },
            });
        
    // const response = await openai.chat.completions.create({
    //     //model: 'gpt-3.5-turbo',
    //     model:'deepseek/deepseek-chat-v3-0324:free',
    //     messages: [
    //         {role: "system", content: context},                            //role system, como se tiene que comportar la ia
    //         ...conversations[userID]                                        //expandir la coversacion 
    //     ] ,
    // });
    //devolver respuesta
    //const reply = response.choices[0].message.content;              //sacar la respuesta del modelo de openia

        
//gemini con pdf
        // const pdfResp = await fetch('https://dstvqyil45ir9.cloudfront.net/wp-content/uploads/2025/02/Instructivo-para-WEB-2025-1.pdf').then((response) => response.arrayBuffer());

        // const contents = [
        //     { text: message},
        //     {
        //         inlineData: {
        //             mimeType: 'application/pdf',
        //             data: Buffer.from(pdfResp).toString("base64")
        //         }
        //     }
        // ];

        // const response = await ai.models.generateContent({
        //     model: "gemini-2.0-flash",
        //         contents: contents,
        //     config: {
        //         systemInstruction: context,
        //     },
        // });

        const reply = response.text;              //sacar la respuesta del modelo gemini
        
        //agregar al asistente  la respuesta
        conversations[userID].push({
            role: 'assistant', 
            parts: [{ 
                text: reply
             }] 
        })

        //limitar contexto de conversacion
        if (conversations[userID].length > 8) {
            conversations[userID] = conversations[userID].slice(-6);                    //nos quedamos con los ultimos 6mensajes
        }

        return res.status(200).json({reply});
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json({
            error: 'Ha ocurrido un error relacionado con la peticion'
        });
    }
});

//servir el backend
    app.listen(port, () =>{
        console.log("todo va  bello pa");
    });

    //export default app;