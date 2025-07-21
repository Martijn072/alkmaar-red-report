
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWordPressAuth } from '@/contexts/WordPressAuthContext';
import { toast } from 'sonner';
import { Loader2, Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm = ({ onSwitchToRegister }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useWordPressAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Vul alle velden in');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Succesvol ingelogd!');
    } else {
      toast.error(result.error || 'Inloggen mislukt');
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Inloggen
        </CardTitle>
        <CardDescription className="text-center">
          Log in met je AZ Fanpage account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="E-mailadres"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Wachtwoord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inloggen...
              </>
            ) : (
              'Inloggen'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button 
            variant="link" 
            onClick={onSwitchToRegister}
            disabled={isLoading}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Nog geen account? Registreer hier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
