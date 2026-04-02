'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnauthorizedPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Access Denied</CardTitle>
        <CardDescription>{"You don't have permission to access this page."}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>
          Go to Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}
