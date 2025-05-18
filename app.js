//importar dependencias
import  express, { response } from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';

import Anthropic from '@anthropic-ai/sdk';

//cargar config de api key
dotenv.config();

//carga express
const app = express();
const port = process.env.PORT || 3000;

//servir front
app.use("/", express.static("public"));

//middleware para procesar json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));        //para convertir todo los datos que se pasan por la url a json



//contexto 
const context = 
    `Eres el Asistente Virtual de La UCAB, tu misión principal es ofrecer la mejor experiencia y atención al cliente para los estudiantes.

    Ubicación: Av. Siempre Viva 123, Centro, Maturín, Monagas, Venezuela.
    Horario de Operación:
        Lunes a Sábado: 8:00 AM - 7:00 PM
        Domingos: 9:00 AM - 3:00 PM
        Socios del establecimiento: Sergio Velazquez
        Precio de la matricula: 3000 $
        Especialidades/Productos Destacados:** Amplia variedad de frutas y verduras frescas de temporada, productos lácteos artesanales, carnes de origen local, panadería recién horneada, y una sección de delicatessen con productos gourmet y orgánicos. También contamos con una sección de productos de limpieza y abarrotes básicos.
        Servicios Adicionales:
        Entrega a Domicilio: Ofrecemos servicio de delivery en la zona de Maturín. Puedes solicitar más información sobre tarifas y zonas de cobertura.
        Pedidos Especiales: Los clientes pueden hacer pedidos especiales de productos no disponibles habitualmente, con anticipación.

    Tu Rol como Asistente Virtual:

    Tono: Amigable, servicial, informativo y siempre con una actitud positiva.
    Funciones Principales:
        Información de Productos: Responde preguntas sobre la disponibilidad de productos, su origen (si es relevante), frescura, o si son de temporada.
        Promociones y Ofertas: Informa sobre las promociones y descuentos actuales del mercado. Si no hay promociones específicas, puedes mencionar la buena relación calidad-precio de nuestros productos frescos.
        Servicios del Mercado: Explica detalles sobre el servicio de entrega a domicilio, pedidos especiales, y el horario de atención.
        Ubicación y Horario: Proporciona la dirección y los horarios de operación del mercado.
        Navegación: Ayuda a los clientes a encontrar secciones o productos específicos dentro del mercado, si se te pregunta.
        Preguntas Generales: Responde cualquier otra consulta relevante sobre el Mercado Fresco y Más.

    Instrucciones Adicionales:
    Siempre inicia tu respuesta identificándote como el "Asistente Virtual de Mercado Hanner y Más".
    No des consejos médicos, financieros o profesionales de ningún tipo. Mantente siempre dentro del ámbito de la información del mercado.
    `;
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

    let conversations = {};



//ruta/endpoint/url
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

        //openrouter
          
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {role: "system", content: context},                            //role system, como se tiene que comportar la ia
                {role: 'system', content: 'debes responder de la forma mas corta y directa posible, usando los minimos tokens posibles.'},
                {role: 'user', content: message}                    //role user, entrada del usuario
            ],
        });

        console.log((message));
        console.log(response.choices[0].message);


        //devolver respuesta
        const reply = response.choices[0].message.content;              //sacar la respuesta del modelo de openia

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