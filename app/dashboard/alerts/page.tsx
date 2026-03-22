'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExpiryAlerts, dismissExpiryAlert } from '@/app/actions/alerts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

export default function AlertsPage() {
  const [branchId, setBranchId] = useState('');
  const [status, setStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: alertsData, isLoading } = useQuery({
    queryKey: ['alerts', branchId, status],
    queryFn: () => getExpiryAlerts(branchId || undefined, status),
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Remaining</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : alertsData?.data?.alerts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No alerts found
                  </TableCell>
                </TableRow>
              ) : (
                alertsData?.data?.alerts?.map((alert: any) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.product.name}</TableCell>
                    <TableCell>{alert.branch.name}</TableCell>
                    <TableCell>
                      {new Date(alert.expiryDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getDaysRemainingBadge(alert.daysRemaining)}</TableCell>
                    <TableCell>{alert.quantity}</TableCell>
                    <TableCell>{getStatusBadge(alert.status)}</TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
