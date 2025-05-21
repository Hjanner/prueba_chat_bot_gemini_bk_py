from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
import os
from google import genai
from google.genai import types
import httpx

load_dotenv()               # carga las variables de entorno

api_bp = Blueprint('api', __name__)

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

#generar un contexto para el asistente
context = """
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
"""


@api_bp.route('/api/chatbot', methods=['POST'])
def mostrar_mensaje():
    # Obtener el mensaje del usuario
    data = request.get_json()
    message = data.get('message', '')
    userID = data.get('userID', 0)
    
    if not message:                     #validaciones
        return jsonify({"error": "No se recibió un mensaje del usuario"}), 400
    if not userID:
        return jsonify({"error" :  "No se recibió el ID del usuario"}), 400


    #leer pdf
    doc_url = "https://dstvqyil45ir9.cloudfront.net/wp-content/uploads/2025/02/Instructivo-para-WEB-2025-1.pdf"
    doc_data = httpx.get(doc_url).content
    
    if not doc_data:                     #validaciones
        return jsonify({"error": "Ocurrio un fallo al leer el pdf"}), 400

    try:
        #consulta a la ai
        response = client.models.generate_content(
        model="gemini-2.0-flash",
        config=types.GenerateContentConfig(
            system_instruction=context),                        #comportamiento del bot
        contents=[
            types.Part.from_bytes(
                data=doc_data,                                  #datos pdf
                mime_type='application/pdf',
            ),
            message                                              #mensaje del usuario
            ]
        )
        
        return jsonify({"reply": response.text})                # devolver respuesta del bot

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    

    

