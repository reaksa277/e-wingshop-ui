'use client';

import { useQuery } from '@tanstack/react-query';
import { getBranches } from '@/app/actions/branches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, User, Package, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BranchesPage() {
  const router = useRouter();

  const { data: branchesData, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => getBranches(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Branches</h1>
        <p className="text-muted-foreground">Manage your store locations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {branchesData?.data?.map((branch: any) => (
          <Card
            key={branch.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/dashboard/branches/${branch.id}`)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{branch.name}</CardTitle>
                <Badge variant={branch.isActive ? 'success' : 'secondary'}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>{branch.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{branch.phone}</span>
              </div>
              {branch.manager && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Manager: {branch.manager.name}</span>
                </div>
              )}
              <div className="flex gap-4 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span>{branch._count.orders} orders</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{branch._count.inventory} low stock</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {branchesData?.data?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No branches found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
