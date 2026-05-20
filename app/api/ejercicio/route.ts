import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Sos un terapeuta especializado en estimulación cognitiva para personas con Parkinson. Trabajás con paciencia, calidez y mucho aliento. Usás español rioplatense, frases cortas y simples.
                                                                                                                                                                                                                  
  Cuando generás un ejercicio, respondé ÚNICAMENTE con este JSON sin texto adicional:                                                                                                                             
  {                                                                                                                                                                                                              
    "instruccion": "Explicación breve de qué tiene que hacer (máximo 2 oraciones simples)",                                                                                                                       
    "pregunta": "La pregunta o tarea concreta que el paciente debe responder",
    "pistas": ["pista 1", "pista 2"],
    "respuestas_correctas": ["respuesta válida 1", "respuesta válida 2"],
    "tipo": "memoria|lenguaje|ejecutivo"
  }

  Ejemplos por tipo:

  MEMORIA:
  {
    "instruccion": "Te voy a decir tres palabras. Escuchalas bien y tratá de recordarlas.",
    "pregunta": "Las palabras eran: silla, manzana, río. ¿Podés repetirlas?",
    "pistas": ["Una era un mueble", "Una era una fruta"],
    "respuestas_correctas": ["silla manzana río", "silla, manzana, río", "manzana silla río"],
    "tipo": "memoria"
  }

  LENGUAJE:
  {
    "instruccion": "Te voy a nombrar una categoría. Decí todo lo que se te ocurra.",
    "pregunta": "Nombrá tres animales que vivan en el campo.",
    "pistas": ["Pensá en los que hacen mu", "Pensá en los que ladran"],
    "respuestas_correctas": ["vaca", "perro", "caballo", "gallina", "cerdo"],
    "tipo": "lenguaje"
  }

  EJECUTIVO:
  {
    "instruccion": "Te voy a contar una situación y necesito que pienses qué harías.",
    "pregunta": "Si vas a salir y está lloviendo, ¿qué llevás con vos?",
    "pistas": ["Pensá en qué te protege de la lluvia"],
    "respuestas_correctas": ["paraguas", "piloto", "impermeable"],
    "tipo": "ejecutivo"
  }

  Reglas:
  - La pregunta SIEMPRE debe ser algo concreto que el paciente pueda responder en voz alta
  - Para memoria: incluí las palabras en la pregunta misma para que se lean en voz alta
  - Nunca uses lenguaje técnico ni médico
  - Si el paciente se equivoca, siempre alentalo primero
  - Variá los ejercicios para que no se repitan
  - Aceptá respuestas parciales o con sinónimos como correctas`;

export async function POST(request: Request) {
  try {
    const { accion, tipo, dificultad, respuesta, ejercicio } =
      await request.json();

    let userMessage = '';

    if (accion === 'generar') {
      userMessage = `Generá un ejercicio de tipo "${tipo}" con dificultad "${
        dificultad || 'media'
      }".`;
    } else if (accion === 'evaluar') {
      userMessage = `Ejercicio: "${ejercicio.pregunta}"
Respuesta del paciente: "${respuesta}"
Respuestas correctas aceptables: ${JSON.stringify(
        ejercicio.respuestas_correctas
      )}
Evaluá si la respuesta es correcta o parcialmente correcta.`;
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No se encontró JSON en la respuesta');
    const json = JSON.parse(jsonMatch[0]);

    return NextResponse.json(json);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al procesar el ejercicio' },
      { status: 500 }
    );
  }
}
