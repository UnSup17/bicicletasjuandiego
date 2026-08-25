// ============================================================
//  app/admin/login/page.tsx — Custom Admin Login Panel (Suspense Wrapped & Bikehouse style)
// ============================================================

'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bike, Loader2, Lock, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        toast.error('Credenciales incorrectas', {
          description: 'Verifica tu email y contraseña.',
        });
      } else {
        toast.success('Sesión iniciada correctamente', {
          description: 'Cargando panel de administración...',
        });
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Ocurrió un error inesperado al intentar iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Return Button */}
        <Link 
          href="/" 
          className="inline-flex items-center text-xs text-neutral-400 hover:text-white transition-colors gap-1.5 font-sans font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={12} />
          Volver a la Tienda Virtual
        </Link>

        <Card className="border border-neutral-800 bg-neutral-900 shadow-2xl rounded-none overflow-hidden">
          <CardHeader className="text-center pt-8 pb-4">
            <img 
              src="/logo.png" 
              alt="Bicicletas Juan Diego" 
              className="h-12 w-auto object-contain mx-auto mb-4"
            />
            <CardTitle className="text-lg font-black font-heading text-white uppercase tracking-widest leading-none">
              Bicicletas <br/>
              <span className="text-[#f2e811] text-xl">Juan Diego</span>
            </CardTitle>
            <CardDescription className="text-[9px] text-neutral-400 uppercase tracking-widest font-sans mt-2.5 font-bold">
              Panel Administrativo
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5 px-6 md:px-8">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-sans font-bold text-neutral-300 uppercase tracking-wider block">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="admin@bicicletasjuandiego.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-neutral-950 border-neutral-800 text-white text-xs font-sans rounded-none focus-visible:ring-neutral-700"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] font-sans font-bold text-neutral-300 uppercase tracking-wider block">Contraseña de Acceso</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-neutral-950 border-neutral-800 text-white text-xs font-sans rounded-none focus-visible:ring-neutral-700"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-6 md:p-8 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-neutral-200 transition-all duration-300 py-6 font-sans font-black uppercase tracking-widest text-xs rounded-none flex items-center justify-center gap-2 border border-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Autenticando...
                  </>
                ) : (
                  'Ingresar al Panel'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Brand Copyright footer */}
        <p className="text-center text-[9px] text-neutral-500 font-sans uppercase font-bold tracking-wider">
          &copy; {new Date().getFullYear()} Juan Diego Bikes. Acceso exclusivo personal staff.
        </p>

      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
