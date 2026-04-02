'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'Access denied.',
    Verification: 'The verification link has expired or is invalid.',
    default: 'An error occurred during authentication.',
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Authentication Error</CardTitle>
        <CardDescription>
          {errorMessages[error || 'default'] || errorMessages.default}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={() => window.location.href = '/auth/login'}>
          Back to Login
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
