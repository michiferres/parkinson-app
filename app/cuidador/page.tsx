'use client';

import { useRouter } from 'next/navigation';

export default function CuidadorPage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#1a1200',
        color: '#f5d77e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '2rem',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center' }}>
        Panel del cuidador
      </h1>

      <div
        style={{
          backgroundColor: '#2a1f00',
          borderRadius: '1.5rem',
          padding: '2rem',
          width: '100%',
          maxWidth: '500px',
          border: '2px solid #e8952a',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <p style={{ fontSize: '1.5rem', textAlign: 'center' }}>
          Próximamente en esta sección:
        </p>
        <ul
          style={{ fontSize: '1.3rem', lineHeight: '2', paddingLeft: '1.5rem' }}
        >
          <li>Historial de ejercicios</li>
          <li>Nivel de dificultad</li>
          <li>Progreso semanal</li>
          <li>Tipos de ejercicio habilitados</li>
        </ul>
      </div>

      <button
        onClick={() => router.push('/paciente')}
        style={{
          backgroundColor: '#c47a1e',
          color: '#1a1200',
          fontSize: '1.6rem',
          fontWeight: 'bold',
          padding: '1.5rem 2.5rem',
          borderRadius: '1.2rem',
          border: 'none',
          width: '100%',
          maxWidth: '420px',
          minHeight: '80px',
          cursor: 'pointer',
        }}
      >
        Ir a los ejercicios
      </button>

      <button
        onClick={() => router.push('/')}
        style={{
          backgroundColor: '#2a1f00',
          color: '#f5d77e',
          fontSize: '1.4rem',
          padding: '1rem 2rem',
          borderRadius: '1.2rem',
          border: '2px solid #e8952a',
          width: '100%',
          maxWidth: '420px',
          minHeight: '65px',
          cursor: 'pointer',
        }}
      >
        Volver al inicio
      </button>
    </main>
  );
}
