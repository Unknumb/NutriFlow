import React, { useState, useEffect } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

/**
 * Layout compartido para las pantallas de autenticación
 * (login, registro, recuperación de contraseña).
 * Replica el fondo con gradientes reactivos al mouse y la tarjeta glassmorphism
 * de LoginScreen para mantener consistencia visual.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased overflow-hidden bg-[#f8f9ff] text-[#0b1c30] relative z-0">
      {/* Efectos de fondo */}
      <div
        className="fixed w-[80vw] h-[80vh] rounded-full top-[-20vh] right-[-20vw] -z-10 pointer-events-none transition-transform duration-75 ease-out"
        style={{
          background:
            "radial-gradient(circle, rgba(125,211,252,0.15) 0%, rgba(255,255,255,0) 70%)",
          transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
        }}
      />
      <div
        className="fixed w-[60vw] h-[60vh] rounded-full bottom-[-10vh] left-[-10vw] -z-10 pointer-events-none transition-transform duration-75 ease-out"
        style={{
          background:
            "radial-gradient(circle, rgba(203,219,245,0.2) 0%, rgba(255,255,255,0) 70%)",
          transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`,
        }}
      />

      <main className="grow flex items-center justify-center p-4 md:p-16 relative z-10">
        <div className="w-full max-w-[480px]">
          <div className="bg-white/85 backdrop-blur-xl border border-white/40 shadow-[0_30px_60px_-15px_rgba(203,219,245,0.4),0_10px_20px_-5px_rgba(203,219,245,0.2),inset_0_1px_0_rgba(255,255,255,0.8)] rounded-2xl p-8 md:p-12 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(203,219,245,0.5)]">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-[32px] font-semibold tracking-tight text-[#0b1c30] mb-2">
                {title}
              </h1>
              <p className="text-sm text-[#3f484e]">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
