//importar dependencias
import  express, { response } from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';

import Anthropic from '@anthropic-ai/sdk';
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




//instancia de openia
    // const openai = new OpenAI({
    //     apiKey: process.env.OpenAI_API_KEY,             //manera de identificarme con openia
    // });

    // const openai = new OpenAI({
    //         baseURL: 'https://api.deepseek.com',
    //         apiKey:  process.env.DEEPSEEK_API_KEY,
    // });
    
    // const anthropic = new Anthropic({
    //     apiKey: process.env.ANTHROPIC_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
    // });

    const openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
    });

    const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
    });


    let conversations = {};

//contexto openia
    // const context = 
    // `Eres el Asistente Virtual de La UCAB, tu misión principal es ofrecer la mejor experiencia y atención al cliente para los estudiantes.

    // Ubicación: Av. Siempre Viva 123, Centro, Maturín, Monagas, Venezuela.
    // Horario de Operación:
    //     Lunes a Sábado: 8:00 AM - 7:00 PM
    //     Domingos: 9:00 AM - 3:00 PM
    //     Precio de la matricula: 3000 $
    //     Especialidades/Productos Destacados: Amplia variedad de frutas y verduras frescas de temporada, productos lácteos artesanales, carnes de origen local, panadería recién horneada, y una sección de delicatessen con productos gourmet y orgánicos. También contamos con una sección de productos de limpieza y abarrotes básicos.
    //     Servicios Adicionales:
    //     Entrega a Domicilio: Ofrecemos servicio de delivery en la zona de Maturín. Puedes solicitar más información sobre tarifas y zonas de cobertura.
    //     Pedidos Especiales: Los clientes pueden hacer pedidos especiales de productos no disponibles habitualmente, con anticipación.

    // Tu Rol como Asistente Virtual:

    // Tono: Amigable, servicial, informativo y siempre con una actitud positiva.
    // Funciones Principales:
    //     Información de Productos: Responde preguntas sobre la disponibilidad de productos, su origen (si es relevante), frescura, o si son de temporada.
    //     Promociones y Ofertas: Informa sobre las promociones y descuentos actuales del mercado. Si no hay promociones específicas, puedes mencionar la buena relación calidad-precio de nuestros productos frescos.
    //     Servicios del Mercado: Explica detalles sobre el servicio de entrega a domicilio, pedidos especiales, y el horario de atención.
    //     Ubicación y Horario: Proporciona la dirección y los horarios de operación del mercado.
    //     Navegación: Ayuda a los clientes a encontrar secciones o productos específicos dentro del mercado, si se te pregunta.
    //     Preguntas Generales: Responde cualquier otra consulta relevante sobre el Mercado Fresco y Más.

    // Instrucciones Adicionales:
    // Siempre inicia tu respuesta identificándote como el "Asistente Virtual de Mercado Hanner y Más".
    // No des consejos médicos, financieros o profesionales de ningún tipo. Mantente siempre dentro del ámbito de la información del mercado.
    // `;

//ruta/endpoint/url

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

app.post("/api/chatbot", async (req, res) => {
    //recibir pregunta del usuario
    const { userID, message } = req.body;
    

    if(!message) return res.status(404).json({error : "Has mandado un mensaje vacio"});
    
    //peticion a la ia
    try {
        //chatgpt
        // const response = await openai.chat.completions.create({
        //     model: "gpt-3.5-turbo",
        //     messages: [
        //         { role: "system", content: context},                            //role system, como se tiene que comportar la ia
        //         {role: 'system', content: 'debes responder de la forma mas corta y directa posible, usando los minimos tokens posibles.'},
        //         {role: 'user', content: message}                    //role user, entrada del usuario
        //     ],
        //     max_tokens: 200,
        // });

        //deepseek    
        // const response = await openai.chat.completions.create({
        //     messages: [
        //         { role: "system", content: context},                            //role system, como se tiene que comportar la ia
        //         {role: 'system', content: 'debes responder de la forma mas corta y directa posible, usando los minimos tokens posibles.'},
        //         {role: 'user', content: message}                    //role user, entrada del usuario
        //     ],
        //     model: "deepseek-chat",
        // });

        // //anthropic
        // const response = await anthropic.messages.create({
        //     model: "claude-3-5-haiku-20241022",
        //     max_tokens: 1024,
        //     messages: [
        //         { role: "system", content: context},                            //role system, como se tiene que comportar la ia
        //         {role: 'system', content: 'debes responder de la forma mas corta y directa posible, usando los minimos tokens posibles.'},
        //         {role: 'user', content: message}                    //role user, entrada del usuario
        //     ],
        // });

        //gemini
    //   const response = await ai.models.generateContent({
    //         model: "gemini-2.0-flash",
    //             contents: message,
    //         //contents: message,
    //         config: {
    //             systemInstruction: context,
    //         },
    //     });

//gemini con pdf
        const pdfResp = await fetch('https://dstvqyil45ir9.cloudfront.net/wp-content/uploads/2025/02/Instructivo-para-WEB-2025-1.pdf').then((response) => response.arrayBuffer());

        const contents = [
            { text: message},
            {
                inlineData: {
                    mimeType: 'application/pdf',
                    data: Buffer.from(pdfResp).toString("base64")
                }
            }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
                contents: contents,
            //contents: message,
            config: {
                systemInstruction: context,
            },
        });

        //openrouter
        // const response = await openai.chat.completions.create({
        //     model: 'gpt-3.5-turbo',
        //     messages: [
        //         {role: "system", content: context},                            //role system, como se tiene que comportar la ia
        //         {role: 'system', content: 'debes responder de la forma mas corta y directa posible, usando los minimos tokens posibles.'},
        //         {role: 'user', content: message}                    //role user, entrada del usuario
        //     ],
        // });

        //devolver respuesta
        //const reply = response.choices[0].message.content;              //sacar la respuesta del modelo de openia

        const reply = response.text;              //sacar la respuesta del modelo gemini

        return res.status(200).json({reply});

    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json({
            error: 'Ha ocurrido un error relacionado con la peticion'
        });
    }
});

//servir el backend
    // app.listen(port, () =>{
    //     console.log("todo va  bello pa");
    // });

    export default app;