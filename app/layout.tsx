import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ejercicios Cognitivos',
  description: 'Estimulación cognitiva para personas con Parkinson',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
