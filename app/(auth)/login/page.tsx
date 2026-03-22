'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Mock user credentials for quick testing
const mockCredentials = [
  { role: 'Superadmin', email: 'superadmin@ewingshop.com' },
  { role: 'Manager', email: 'manager1@ewingshop.com' },
  { role: 'Staff', email: 'staff1@ewingshop.com' },
  { role: 'Viewer', email: 'viewer@ewingshop.com' },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Login successful!');
        router.push(callbackUrl);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (email: string) => {
    // Auto-fill password for testing
    const form = document.querySelector('form');
    if (form) {
      const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
      const passwordInput = form.querySelector('input[type="password"]') as HTMLInputElement;
      if (emailInput) emailInput.value = email;
      if (passwordInput) passwordInput.value = 'password123';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          🦅 E-WingShop
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={isLoading}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          
          {/* Quick test credentials */}
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-2">Quick test accounts (password: password123)</p>
            <div className="grid grid-cols-2 gap-2">
              {mockCredentials.map((cred) => (
                <Button
                  key={cred.email}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => fillCredentials(cred.email)}
                  className="text-xs"
                >
                  {cred.role}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
