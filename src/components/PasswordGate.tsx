import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, KeyRound, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PasswordGateProps {
  children: React.ReactNode;
}

const SESSION_KEY = 'commission_app_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const PasswordGate = ({ children }: PasswordGateProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    // Check local session first
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      const { timestamp } = JSON.parse(session);
      if (Date.now() - timestamp < SESSION_DURATION) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
      localStorage.removeItem(SESSION_KEY);
    }

    // Check if password exists in database
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'app_password')
      .maybeSingle();

    if (error) {
      console.error('Error checking password:', error);
    }

    setHasPassword(!!data?.value);
    setIsSettingUp(!data?.value);
    setIsLoading(false);
  };

  const hashPassword = async (pwd: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd + 'commission_salt_v1');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const hashedPassword = await hashPassword(password);

    const { error: dbError } = await supabase
      .from('settings')
      .insert({ key: 'app_password', value: hashedPassword });

    if (dbError) {
      toast.error('Error al configurar la contraseña');
      return;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify({ timestamp: Date.now() }));
    setIsAuthenticated(true);
    toast.success('Contraseña configurada correctamente');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const hashedInput = await hashPassword(password);

    const { data, error: dbError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'app_password')
      .maybeSingle();

    if (dbError || !data) {
      setError('Error al verificar la contraseña');
      return;
    }

    if (data.value === hashedInput) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ timestamp: Date.now() }));
      setIsAuthenticated(true);
      toast.success('¡Bienvenido!');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card border-border shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-lg">
            {isSettingUp ? (
              <KeyRound className="h-8 w-8 text-primary-foreground" />
            ) : (
              <Lock className="h-8 w-8 text-primary-foreground" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isSettingUp ? 'Configurar Acceso' : 'Calculadora de Comisiones'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSettingUp 
              ? 'Crea una contraseña para proteger tu app' 
              : 'Ingresa tu contraseña para continuar'}
          </p>
        </div>

        <form onSubmit={isSettingUp ? handleSetupPassword : handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSettingUp ? 'Crear contraseña' : 'Tu contraseña'}
                className="pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isSettingUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetir contraseña"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg">
            {isSettingUp ? 'Configurar Contraseña' : 'Entrar'}
          </Button>
        </form>

        {isSettingUp && (
          <p className="text-xs text-muted-foreground text-center mt-6">
            Esta contraseña protegerá el acceso a tu calculadora. 
            Asegúrate de recordarla.
          </p>
        )}
      </Card>
    </div>
  );
};
