'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { alertService } from '@/services/alert.service';
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
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function AlertsPage() {
  const [status, setStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: alertsResponse, isLoading } = useQuery({
    queryKey: ['alerts', status],
    queryFn: () => alertService.getAll(0, 100, status === 'all' ? undefined : status),
  });

  const dismissMutation = useMutation({
    mutationFn: (alertId: string) => alertService.dismiss(alertId),
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
        <Badge variant="destructive" className="w-20 justify-center">
          {days} days
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="w-20 justify-center">
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
      <div className="flex items-center gap-3">
        <AlertCircle className="h-8 w-8 text-yellow-600" />
        <div>
          <h1 className="text-3xl font-bold">Expiry Alerts</h1>
          <p className="text-muted-foreground">Monitor products approaching expiry</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-37.5">
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : alertsResponse?.data?.alerts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No alerts found
                  </TableCell>
                </TableRow>
              ) : (
                alertsResponse?.data?.alerts?.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.product?.name || 'Unknown'}</TableCell>
                    <TableCell>{alert.branch?.name || 'N/A'}</TableCell>
                    <TableCell>{new Date(alert.expiryDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getDaysRemainingBadge(alert.daysRemaining || 0)}</TableCell>
                    <TableCell>{getStatusBadge(alert.status)}</TableCell>
                    <TableCell className="text-right">
                      {alert.status === 'ACTIVE' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => dismissMutation.mutate(alert.id)}
                          disabled={dismissMutation.isPending}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Dismiss
                        </Button>
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
