'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { getExpiryAlerts, dismissExpiryAlert, type ExpiryAlert } from '@/app/actions/alerts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { RoleGuard } from '@/components/dashboard/RoleGuard';
import { DataTable } from '@/components/ui/data-table';

export default function AlertsPage() {
  const [status, setStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: alertsData, isLoading } = useQuery({
    queryKey: ['alerts', status],
    queryFn: () => getExpiryAlerts(undefined, status),
  });

  const dismissMutation = useMutation({
    mutationFn: ({ alertId, note }: { alertId: string; note?: string }) =>
      dismissExpiryAlert(alertId, note),
    onSuccess: () => {
      toast.success('Alert dismissed successfully');
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts-count'] });
    },
    onError: () => {
      toast.error('Failed to dismiss alert');
    },
  });

  const getDaysRemainingBadge = (days: number) => {
    if (days <= 0) {
      return (
        <Badge variant="destructive" className="w-20 justify-center">
          Expired
        </Badge>
      );
    } else if (days <= 7) {
      return (
        <Badge variant="destructive" className="w-20 justify-center">
          {days} days
        </Badge>
      );
    } else if (days <= 30) {
      return (
        <Badge variant="warning" className="w-20 justify-center">
          {days} days
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="w-20 justify-center">
        {days} days
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default">Active</Badge>;
      case 'DISMISSED':
        return <Badge variant="secondary">Dismissed</Badge>;
      case 'EXPIRED':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // Define columns for DataTable
  const columns: ColumnDef<ExpiryAlert>[] = [
    {
      accessorKey: 'product',
      header: 'Product',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.product.name}</span>
      ),
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ row }) => row.original.branch.name,
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expiry Date',
      cell: ({ row }) => new Date(row.getValue('expiryDate') as string).toLocaleDateString(),
    },
    {
      accessorKey: 'daysRemaining',
      header: 'Days Remaining',
      cell: ({ row }) => getDaysRemainingBadge(row.getValue('daysRemaining') as number),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => row.getValue('quantity'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status') as string),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const alert = row.original;
        return (
          <div className="flex justify-end">
            {alert.status === 'ACTIVE' && (
              <RoleGuard permission="dismiss_expiry_alerts">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dismissMutation.mutate({ alertId: alert.id })}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Dismiss
                </Button>
              </RoleGuard>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Expiry Alerts</h1>
        <p className="text-muted-foreground">Monitor products approaching expiry</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="DISMISSED">Dismissed</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={alertsData?.data?.alerts ?? []}
            filterColumn="product"
            filterPlaceholder="Search alerts..."
            isLoading={isLoading}
            enablePagination={false}
            emptyState={{
              title: 'No alerts found',
              description: 'No expiry alerts match your current filters.',
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
