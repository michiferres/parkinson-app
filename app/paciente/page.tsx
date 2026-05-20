'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Ejercicio {
  instruccion: string;
  pregunta: string;
  pistas: string[];
  respuestas_correctas: string[];
  tipo: string;
}

interface Feedback {
  correcto: boolean;
  parcial: boolean;
  mensaje: string;
  respuesta_correcta: string;
}

const TIPOS = [
  { id: 'memoria', label: 'Memoria' },
  { id: 'lenguaje', label: 'Lenguaje' },
  { id: 'ejecutivo', label: 'Razonamiento' },
];

const s = {
  pagina: {
    minHeight: '100vh',
    backgroundColor: '#1a1200',
    color: '#f5d77e',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '1.5rem',
  },
  titulo: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    color: '#f5d77e',
    lineHeight: '1.3',
  },
  boton: {
    backgroundColor: '#c47a1e',
    color: '#1a1200',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    padding: '1.5rem 2.5rem',
    borderRadius: '1.2rem',
    border: 'none',
    width: '100%',
    maxWidth: '420px',
    minHeight: '85px',
  },
  botonSecundario: {
    backgroundColor: '#2a1f00',
    color: '#f5d77e',
    fontSize: '1.4rem',
    padding: '1rem 2rem',
    borderRadius: '1.2rem',
    border: '2px solid #e8952a',
    width: '100%',
    maxWidth: '420px',
    minHeight: '65px',
  },
  card: {
    backgroundColor: '#2a1f00',
    borderRadius: '1.5rem',
    padding: '2rem',
    width: '100%',
    maxWidth: '560px',
    border: '2px solid #e8952a',
  },
  texto: {
    fontSize: '1.8rem',
    textAlign: 'center' as const,
    lineHeight: '1.6',
  },
};

export default function PacientePage() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<'seleccion' | 'ejercicio' | 'feedback'>(
    'seleccion'
  );
  const [ejercicio, setEjercicio] = useState<Ejercicio | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [escuchando, setEscuchando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [respuestaDetectada, setRespuestaDetectada] = useState('');
  const recognitionRef = useRef<any>(null);

  const getVoz = () => {
    const voces = window.speechSynthesis.getVoices();
    return (
      voces.find((v) => v.lang.startsWith('es') && v.localService) ||
      voces.find((v) => v.lang.startsWith('es')) ||
      null
    );
  };

  const hablar = (texto: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.rate = 0.65;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voz = getVoz();
    if (voz) utterance.voice = voz;
    else utterance.lang = 'es';
    window.speechSynthesis.speak(utterance);
  };

  const hablarSecuencia = (textos: string[]) => {
    window.speechSynthesis.cancel();
    const hablarTexto = (index: number) => {
      if (index >= textos.length) return;
      const utterance = new SpeechSynthesisUtterance(textos[index]);
      utterance.rate = 0.65;
      utterance.pitch = 1;
      utterance.volume = 1;
      const voz = getVoz();
      if (voz) utterance.voice = voz;
      else utterance.lang = 'es';
      utterance.onend = () => setTimeout(() => hablarTexto(index + 1), 1000);
      window.speechSynthesis.speak(utterance);
    };
    const voces = window.speechSynthesis.getVoices();
    if (voces.length > 0) {
      hablarTexto(0);
    } else {
      window.speechSynthesis.addEventListener(
        'voiceschanged',
        () => hablarTexto(0),
        { once: true }
      );
    }
  };

  const generarEjercicio = async (tipo: string) => {
    setCargando(true);
    try {
      const res = await fetch('/api/ejercicio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'generar', tipo, dificultad: 'media' }),
      });
      const data = await res.json();
      console.log('Respuesta de Claude:', data);
      setEjercicio(data);
      setEtapa('ejercicio');
      setTimeout(
        () => hablarSecuencia([data.instruccion, data.pregunta, data.pregunta]),
        500
      );
    } catch (error) {
      console.error(error);
    }
    setCargando(false);
  };

  const evaluarRespuesta = async (respuesta: string) => {
    if (!respuesta.trim() || !ejercicio) return;
    setCargando(true);
    try {
      const res = await fetch('/api/ejercicio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'evaluar', respuesta, ejercicio }),
      });
      const data = await res.json();
      setFeedback(data);
      setEtapa('feedback');
      setTimeout(() => hablar(data.mensaje), 300);
    } catch (error) {
      console.error(error);
    }
    setCargando(false);
  };

  const iniciarEscucha = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert('Usá Chrome para el reconocimiento de voz.');
      return;
    }
    const recognition = new SR();
    recognition.lang = 'es-AR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setEscuchando(true);
    recognition.onend = () => setEscuchando(false);
    recognition.onresult = (event: any) => {
      const texto = event.results[0][0].transcript;
      setRespuestaDetectada(texto);
      evaluarRespuesta(texto);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const reiniciar = () => {
    setEtapa('seleccion');
    setEjercicio(null);
    setFeedback(null);
    setRespuestaDetectada('');
  };

  if (cargando) {
    return (
      <div style={s.pagina}>
        <p style={s.titulo}>Preparando el ejercicio...</p>
      </div>
    );
  }

  if (etapa === 'seleccion') {
    return (
      <div style={s.pagina}>
        <h1 style={s.titulo}>¿Qué tipo de ejercicio querés hacer hoy?</h1>
        {TIPOS.map((tipo) => (
          <button
            key={tipo.id}
            style={s.boton}
            onClick={() => generarEjercicio(tipo.id)}
          >
            {tipo.label}
          </button>
        ))}
        <button style={s.botonSecundario} onClick={() => router.push('/')}>
          Volver al inicio
        </button>
      </div>
    );
  }

  if (etapa === 'ejercicio') {
    return (
      <div style={s.pagina}>
        <div style={s.card}>
          <p
            style={{
              ...s.texto,
              color: '#e8952a',
              fontSize: '1.4rem',
              marginBottom: '1rem',
            }}
          >
            {ejercicio?.instruccion}
          </p>
          <p style={{ ...s.texto, fontSize: '2.2rem', fontWeight: 'bold' }}>
            {ejercicio?.pregunta}
          </p>
        </div>

        <button
          onClick={iniciarEscucha}
          style={{
            backgroundColor: escuchando ? '#e8952a' : '#c47a1e',
            border: 'none',
            borderRadius: '50%',
            width: '130px',
            height: '130px',
            fontSize: '3.5rem',
            cursor: 'pointer',
          }}
        >
          {escuchando ? '👂' : '🎤'}
        </button>

        <p style={{ ...s.texto, fontSize: '1.3rem', color: '#e8952a' }}>
          {escuchando ? 'Escuchando...' : 'Tocá el micrófono para responder'}
        </p>

        {respuestaDetectada && (
          <p style={{ ...s.texto, fontSize: '1.4rem' }}>
            Dijiste: "{respuestaDetectada}"
          </p>
        )}

        <button
          style={s.botonSecundario}
          onClick={() =>
            hablar(`${ejercicio?.instruccion}. ${ejercicio?.pregunta}`)
          }
        >
          Repetir pregunta
        </button>
      </div>
    );
  }

  if (etapa === 'feedback') {
    return (
      <div style={s.pagina}>
        <div
          style={{
            ...s.card,
            borderColor: feedback?.correcto ? '#7ecf6e' : '#e8952a',
          }}
        >
          <p
            style={{
              fontSize: '4rem',
              textAlign: 'center',
              marginBottom: '1rem',
            }}
          >
            {feedback?.correcto ? '✓' : feedback?.parcial ? '≈' : '✗'}
          </p>
          <p style={s.texto}>{feedback?.mensaje}</p>
          {!feedback?.correcto && feedback?.respuesta_correcta && (
            <p
              style={{
                ...s.texto,
                fontSize: '1.5rem',
                color: '#e8952a',
                marginTop: '1.5rem',
              }}
            >
              La respuesta era: {feedback.respuesta_correcta}
            </p>
          )}
        </div>

        <button style={s.boton} onClick={reiniciar}>
          Otro ejercicio
        </button>
      </div>
    );
  }
}
