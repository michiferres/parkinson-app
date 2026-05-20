'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        padding: '2rem',
        backgroundColor: '#1a1200',
      }}
    >
      <h1
        style={{
          fontSize: '2.5rem',
          color: '#f5d77e',
          textAlign: 'center',
          marginBottom: '1rem',
          lineHeight: '1.3',
        }}
      >
        Ejercicios para la mente
      </h1>

      <button
        onClick={() => router.push('/paciente')}
        style={{
          backgroundColor: '#c47a1e',
          color: '#1a1200',
          fontSize: '2rem',
          fontWeight: 'bold',
          padding: '1.5rem 3rem',
          borderRadius: '1.2rem',
          minWidth: '320px',
          minHeight: '90px',
        }}
      >
        Soy el paciente
      </button>

      <button
        onClick={() => router.push('/cuidador')}
        style={{
          backgroundColor: '#2a1f00',
          color: '#f5d77e',
          fontSize: '1.6rem',
          padding: '1rem 2rem',
          borderRadius: '1.2rem',
          border: '2px solid #e8952a',
          minWidth: '320px',
          minHeight: '70px',
        }}
      >
        Soy el cuidador / familiar
      </button>
    </main>
  );
}
