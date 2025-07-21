import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWordPressAuth } from '@/contexts/WordPressAuthContext';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, UserCircle } from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useWordPressAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { username, email, password, confirmPassword, displayName } = formData;

    if (!username || !email || !password || !displayName) {
      toast.error('Vul alle velden in');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen');
      return;
    }

    if (password.length < 6) {
      toast.error('Wachtwoord moet minimaal 6 karakters lang zijn');
      return;
    }

    setIsLoading(true);
    const result = await register(username, email, password, displayName);
    
    if (result.success) {
      toast.success('Account succesvol aangemaakt!');
    } else {
      toast.error(result.error || 'Registratie mislukt');
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Registreren
        </CardTitle>
        <CardDescription className="text-center">
          Maak een nieuw AZ Fanpage account aan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Gebruikersnaam"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={isLoading}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Weergavenaam"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                disabled={isLoading}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="E-mailadres"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
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
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
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
                placeholder="Bevestig wachtwoord"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
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
                Registreren...
              </>
            ) : (
              'Account aanmaken'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button 
            variant="link" 
            onClick={onSwitchToLogin}
            disabled={isLoading}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Al een account? Log hier in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};