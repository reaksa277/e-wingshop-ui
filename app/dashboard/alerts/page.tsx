'use client';

import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { useLowStock, useExpiringSoon, useExpiredInventory, useBranches } from '@/hooks';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { AlertTriangle, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { InventoryResponse } from '@/types';

type AlertTab = 'low-stock' | 'expiring' | 'expired';

const ITEMS_PER_PAGE = 10;

export default function AlertsPage() {
  const [tab, setTab] = useState<AlertTab>('low-stock');
  const [branchId, setBranchId] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);

  const { data: branches } = useBranches();
  const selectedBranchId = branchId === 'all' ? undefined : Number(branchId);

  const { data: lowStockData, isLoading: isLoadingLow } = useLowStock(selectedBranchId);
  const { data: expiringData, isLoading: isLoadingExpiring } = useExpiringSoon(
    selectedBranchId,
    30
  );
  const { data: expiredData, isLoading: isLoadingExpired } = useExpiredInventory();

  const isLoading =
    tab === 'low-stock' ? isLoadingLow : tab === 'expiring' ? isLoadingExpiring : isLoadingExpired;

  const rows = tab === 'low-stock' ? lowStockData : tab === 'expiring' ? expiringData : expiredData;

  // Client-side pagination
  const paginatedRows = useMemo(() => {
    if (!rows) return [];
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return rows.slice(start, end);
  }, [rows, currentPage]);

  const totalPages = Math.ceil((rows?.length ?? 0) / ITEMS_PER_PAGE);

  // Define columns for DataTable
  const columns: ColumnDef<InventoryResponse>[] = [
    {
      accessorKey: 'productName',
      header: 'Product',
      cell: ({ row }) => <span className="font-medium">{row.getValue('productName')}</span>,
    },
    {
      accessorKey: 'branchName',
      header: 'Branch',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue('branchName')}</span>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => <span className="font-bold">{row.getValue('quantity')}</span>,
    },
    {
      accessorKey: 'lowStockThreshold',
      header: 'Threshold',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue('lowStockThreshold')}</span>
      ),
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expiry Date',
      cell: ({ row }) => {
        const inv = row.original;
        if (!inv.expiryDate) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <div className="flex flex-col">
            <span className="text-sm">{new Date(inv.expiryDate).toLocaleDateString()}</span>
            {inv.daysUntilExpiry !== undefined && (
              <span
                className={`text-xs font-semibold ${
                  inv.daysUntilExpiry < 0
                    ? 'text-destructive'
                    : inv.daysUntilExpiry <= 7
                      ? 'text-amber-600'
                      : 'text-muted-foreground'
                }`}
              >
                {inv.daysUntilExpiry < 0
                  ? `${Math.abs(inv.daysUntilExpiry)}d ago`
                  : `${inv.daysUntilExpiry}d left`}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const inv = row.original;
        if (tab === 'low-stock') {
          return (
            <Badge variant="outline" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Low Stock
            </Badge>
          );
        }
        if (tab === 'expiring') {
          const days = inv.daysUntilExpiry ?? 0;
          if (days <= 0) {
            return <Badge variant="destructive">Expired</Badge>;
          }
          return (
            <Badge variant="warning" className="gap-1">
              <Clock className="h-3 w-3" />
              {days}d left
            </Badge>
          );
        }
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Expired
          </Badge>
        );
      },
    },
  ];

  const getRowClass = (row: InventoryResponse) => {
    if (tab === 'expired' || (row.daysUntilExpiry !== undefined && row.daysUntilExpiry < 0)) {
      return 'bg-red-50/50 hover:bg-red-50';
    }
    if (tab === 'low-stock') {
      return 'bg-amber-50/50 hover:bg-amber-50';
    }
    if (tab === 'expiring' && row.daysUntilExpiry !== undefined && row.daysUntilExpiry <= 7) {
      return 'bg-orange-50/50 hover:bg-orange-50';
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Alerts</h1>
        <p className="text-muted-foreground">Monitor low stock, expiring, and expired items</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold">{lowStockData?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon (30d)</p>
                <p className="text-2xl font-bold">{expiringData?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expired Items</p>
                <p className="text-2xl font-bold">{expiredData?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as AlertTab);
            setCurrentPage(0);
          }}
          className="flex-1"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="low-stock" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Low Stock
              {lowStockData?.length ? (
                <Badge variant="outline" className="h-5 px-1.5 ml-1">
                  {lowStockData.length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="expiring" className="gap-2">
              <Clock className="h-4 w-4" />
              Expiring
              {expiringData?.length ? (
                <Badge variant="outline" className="h-5 px-1.5 ml-1">
                  {expiringData.length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="expired" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Expired
              {expiredData?.length ? (
                <Badge variant="destructive" className="h-5 px-1.5 ml-1">
                  {expiredData.length}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select
          value={branchId}
          onValueChange={(val) => {
            setBranchId(val);
            setCurrentPage(0);
          }}
        >
          <SelectTrigger className="w-full md:md:w-50">
            <SelectValue placeholder="All Branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches?.map((b) => (
              <SelectItem key={b.id} value={b.id.toString()}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Alerts Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={paginatedRows}
            filterColumn="productName"
            filterPlaceholder="Search items..."
            isLoading={isLoading}
            enablePagination={false}
            emptyState={{
              title: 'No alerts found',
              description: `No ${tab === 'low-stock' ? 'low stock' : tab === 'expiring' ? 'expiring' : 'expired'} items match your current filters.`,
            }}
            getRowClass={getRowClass}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing {currentPage * ITEMS_PER_PAGE + 1}-
            {Math.min((currentPage + 1) * ITEMS_PER_PAGE, rows?.length ?? 0)} of {rows?.length ?? 0}{' '}
            items
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <div className="flex items-center gap-1 px-2">
              <span className="text-sm text-muted-foreground">Page</span>
              <span className="text-sm font-medium">{currentPage + 1}</span>
              <span className="text-sm text-muted-foreground">of {totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
