'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAlertsByCategory } from '@/hooks/use-alerts';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  CheckCircle2,
  AlertCircle,
  Package,
  Calendar,
  Clock,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export default function AlertsPage() {
  const [category, setCategory] = useState<
    'all' | 'ONE_MONTH' | 'TWO_WEEKS' | 'ONE_WEEK' | 'EXPIRED'
  >('all');
  const [branchId, setBranchId] = useState<number | undefined>();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: alertsData, isLoading } = useAlertsByCategory(branchId);

  const dismissMutation = useMutation({
    mutationFn: (alertId: string) => alertService.dismiss(alertId),
    onSuccess: () => {
      toast.success('Alert dismissed successfully');
      queryClient.invalidateQueries({ queryKey: ['alerts-by-category'] });
      queryClient.invalidateQueries({ queryKey: ['alerts-count'] });
    },
    onError: () => {
      toast.error('Failed to dismiss alert');
    },
  });

  const getAlertsForCategory = () => {
    if (!alertsData) return [];
    if (category === 'all') {
      return [
        ...alertsData.oneMonth,
        ...alertsData.twoWeeks,
        ...alertsData.oneWeek,
        ...alertsData.expired,
      ];
    }
    if (category === 'ONE_MONTH') return alertsData.oneMonth;
    if (category === 'TWO_WEEKS') return alertsData.twoWeeks;
    if (category === 'ONE_WEEK') return alertsData.oneWeek;
    if (category === 'EXPIRED') return alertsData.expired;
    return [];
  };

  const alerts = getAlertsForCategory();

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'ONE_MONTH':
        return <Badge className="bg-blue-500 hover:bg-blue-600">1 Month</Badge>;
      case 'TWO_WEEKS':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">2 Weeks</Badge>;
      case 'ONE_WEEK':
        return <Badge className="bg-orange-500 hover:bg-orange-600">1 Week</Badge>;
      case 'EXPIRED':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge>{cat}</Badge>;
    }
  };

  const getDaysRemainingBadge = (days: number) => {
    if (days <= 0) {
      return (
        <Badge variant="destructive" className="w-20 justify-center">
          {Math.abs(days)}d ago
        </Badge>
      );
    } else if (days <= 7) {
      return (
        <Badge className="bg-red-500 hover:bg-red-600 w-20 justify-center">{days}d left</Badge>
      );
    } else if (days <= 14) {
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600 w-20 justify-center">
          {days}d left
        </Badge>
      );
    } else if (days <= 30) {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 w-20 justify-center">
          {days}d left
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="w-20 justify-center">
        {days}d left
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

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'ONE_MONTH':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'TWO_WEEKS':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'ONE_WEEK':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'EXPIRED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">1 Month</p>
                <p className="text-2xl font-bold">{alertsData?.totals.oneMonth || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">2 Weeks</p>
                <p className="text-2xl font-bold">{alertsData?.totals.twoWeeks || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">1 Week</p>
                <p className="text-2xl font-bold">{alertsData?.totals.oneWeek || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">{alertsData?.totals.expired || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap items-center">
            <Select value={category} onValueChange={(v: any) => setCategory(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="ONE_MONTH">1 Month</SelectItem>
                <SelectItem value="TWO_WEEKS">2 Weeks</SelectItem>
                <SelectItem value="ONE_WEEK">1 Week</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts by Category Tabs */}
      <Tabs defaultValue="all" value={category} onValueChange={(v: any) => setCategory(v)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="ONE_MONTH">
            {getCategoryIcon('ONE_MONTH')}
            <span className="ml-2">1 Month</span>
            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
              {alertsData?.totals.oneMonth || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="TWO_WEEKS">
            {getCategoryIcon('TWO_WEEKS')}
            <span className="ml-2">2 Weeks</span>
            <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700">
              {alertsData?.totals.twoWeeks || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="ONE_WEEK">
            {getCategoryIcon('ONE_WEEK')}
            <span className="ml-2">1 Week</span>
            <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
              {alertsData?.totals.oneWeek || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="EXPIRED">
            {getCategoryIcon('EXPIRED')}
            <span className="ml-2">Expired</span>
            <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
              {alertsData?.totals.expired || 0}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Alerts Table */}
        <Card className="mt-4">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
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
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                        <p className="text-muted-foreground">No alerts in this category</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{getCategoryBadge(alert.category)}</TableCell>
                      <TableCell className="font-medium">
                        {alert.product?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{alert.branch?.name || 'N/A'}</TableCell>
                      <TableCell>{new Date(alert.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getDaysRemainingBadge(alert.daysRemaining || 0)}</TableCell>
                      <TableCell>{getStatusBadge(alert.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/inventory?productId=${alert.productId}&branchId=${alert.branchId}`
                              )
                            }
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Check Stock
                          </Button>
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
