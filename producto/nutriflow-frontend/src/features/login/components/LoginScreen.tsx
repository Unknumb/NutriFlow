import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'; 

export const LoginScreen: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showPassword, setShowPassword] = useState(false); // Estado para visibilidad

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased overflow-hidden bg-[#f8f9ff] text-[#0b1c30] relative z-0">
      
      {/* Efectos de fondo */}
      <div 
        className="fixed w-[80vw] h-[80vh] rounded-full top-[-20vh] right-[-20vw] -z-10 pointer-events-none transition-transform duration-75 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(125,211,252,0.15) 0%, rgba(255,255,255,0) 70%)',
          transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`
        }}
      />
      <div 
        className="fixed w-[60vw] h-[60vh] rounded-full bottom-[-10vh] left-[-10vw] -z-10 pointer-events-none transition-transform duration-75 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(203,219,245,0.2) 0%, rgba(255,255,255,0) 70%)',
          transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`
        }}
      />

      <main className="flex-grow flex items-center justify-center p-4 md:p-16 relative z-10">
        <div className="w-full max-w-[480px]">
          
          <div className="bg-white/85 backdrop-blur-[24px] border border-white/40 shadow-[0_30px_60px_-15px_rgba(203,219,245,0.4),0_10px_20px_-5px_rgba(203,219,245,0.2),inset_0_1px_0_rgba(255,255,255,0.8)] rounded-2xl p-8 md:p-12 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(203,219,245,0.5)]">
            
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-[32px] font-semibold tracking-tight text-[#0b1c30] mb-2">
                Iniciar Sesión
              </h1>
              <p className="text-sm text-[#3f484e]">
                Accede a tu panel clínico
              </p>
            </div>

            <form className="space-y-6 flex flex-col" onSubmit={(e) => e.preventDefault()}>
              
              {/* Animación invertida: Password con delay menor, Email con delay mayor */}
              <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <label className="text-xs font-semibold tracking-wide text-[#3f484e] ml-1 uppercase" htmlFor="email">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="nombre@ejemplo.com" 
                    required 
                    className="w-full bg-white/50 backdrop-blur-sm border-b-2 border-transparent focus:border-[#7dd3fc] focus:bg-white focus:ring-0 rounded-t-lg px-3 py-2.5 pl-11 text-base text-[#0b1c30] placeholder-[#bec8ce] transition-all duration-300 outline-none shadow-inner"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="flex justify-between items-baseline ml-1 mr-1">
                  <label className="text-xs font-semibold tracking-wide text-[#3f484e] uppercase" htmlFor="password">
                    Contraseña
                  </label>
                  <a href="#" className="text-xs font-semibold text-[#006686] hover:text-[#7bd1fa] transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                  <input 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    required 
                    className="w-full bg-white/50 backdrop-blur-sm border-b-2 border-transparent focus:border-[#7dd3fc] focus:bg-white focus:ring-0 rounded-t-lg px-3 py-2.5 pl-11 pr-11 text-base text-[#0b1c30] placeholder-[#bec8ce] transition-all duration-300 outline-none shadow-inner"
                  />
                  {/* Botón para mostrar/ocultar */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6f787e] hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="pt-2 mt-2 flex flex-col gap-4">
                <button 
                  type="submit" 
                  className="w-full bg-[#7dd3fc] text-white font-medium text-[15px] py-3 rounded-xl hover:bg-[#6ecaf4] hover:shadow-[0_0_20px_rgba(125,211,252,0.4)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Ingresar
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <p className="text-center text-sm text-[#3f484e] mt-2">
                  ¿No tienes una cuenta? <a href="#" className="text-[#006686] font-medium hover:underline">Solicitar Acceso</a>
                </p>
              </div>
            </form>

          </div>
        </div>
      </main>
    </div>
  );
};