'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

import { useProducts, useCategories, useCreateProduct, useDeleteProduct } from '@/hooks';
import { useAuth } from '@/lib/auth-context';
import type { ProductResponse, ProductRequest } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canManage, isOwner } = useAuth();

  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '');
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined
  );
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<ProductRequest>>({});

  const { data, isLoading } = useProducts({
    keyword: keyword || undefined,
    categoryId,
    page,
    size,
  });

  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();

  function set(key: keyof ProductRequest, value: unknown) {
    setFormData((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || formData.sellingPrice === undefined) return;

    await createProduct.mutateAsync(formData as ProductRequest);
    setShowForm(false);
    setFormData({});
  }

  // Define columns for DataTable
  const columns: ColumnDef<ProductResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/dashboard/products/${row.original.id}`)}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {row.getValue('name')}
        </button>
      ),
    },
    {
      accessorKey: 'barcode',
      header: 'Barcode',
      cell: ({ row }) => row.getValue('barcode') ?? '—',
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (row.original.category?.name ?? '—') as React.ReactNode,
    },
    {
      accessorKey: 'costPrice',
      header: 'Cost',
      cell: ({ row }) => `$${Number(row.getValue('costPrice')).toFixed(2)}`,
    },
    {
      accessorKey: 'sellingPrice',
      header: 'Price',
      cell: ({ row }) => (
        <span className="font-medium">${Number(row.getValue('sellingPrice')).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'destructive'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => router.push(`/dashboard/products/${product.id}`)}
            >
              <Edit className="h-5 w-5" />
            </Button>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-destructive hover:text-destructive/80"
                onClick={() => {
                  if (confirm(`Deactivate "${product.name}"?`)) {
                    deleteProduct.mutate(product.id);
                  }
                }}
                disabled={deleteProduct.isPending}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>

        {canManage && (
          <Button className="bg-primary" onClick={() => setShowForm(!showForm)}>
            + New product
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
              <Input
                required
                placeholder="Name *"
                value={formData.name ?? ''}
                onChange={(e) => set('name', e.target.value)}
              />

              <Input
                placeholder="Barcode"
                value={formData.barcode ?? ''}
                onChange={(e) => set('barcode', e.target.value)}
              />

              <Select
                value={formData.categoryId?.toString() ?? ''}
                onValueChange={(v) => set('categoryId', Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category *" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                required
                type="number"
                step="0.01"
                placeholder="Cost price *"
                value={formData.costPrice ?? ''}
                onChange={(e) => set('costPrice', Number(e.target.value))}
              />

              <Input
                required
                type="number"
                step="0.01"
                placeholder="Selling price *"
                value={formData.sellingPrice ?? ''}
                onChange={(e) => set('sellingPrice', Number(e.target.value))}
              />

              <Input
                placeholder="Description"
                value={formData.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
              />

              <div className="col-span-full flex gap-2">
                <Button type="submit" disabled={createProduct.isPending}>
                  {createProduct.isPending ? 'Saving…' : 'Create'}
                </Button>

                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>

                {createProduct.isError && (
                  <span className="text-sm text-destructive">
                    {(createProduct.error as Error).message}
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <Input
          placeholder="Search by name or barcode…"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(0);
          }}
        />

        <Select
          value={categoryId?.toString() ?? ''}
          onValueChange={(v) => {
            setCategoryId(v ? Number(v) : undefined);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-50">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={data?.content ?? []}
            filterColumn="name"
            filterPlaceholder="Search products..."
            isLoading={isLoading}
            enablePagination={true}
            pageSize={10}
            totalCount={data?.totalElements}
            emptyState={{
              title: 'No products found',
              description:
                keyword || categoryId
                  ? 'Try adjusting your search or filters.'
                  : 'Create your first product to get started.',
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
