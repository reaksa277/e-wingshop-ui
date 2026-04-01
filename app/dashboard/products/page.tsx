"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  useProducts,
  useCategories,
  useCreateProduct,
  useDeleteProduct,
} from "@/hooks";
import { useAuth } from "@/lib/auth-context";
import type { ProductRequest } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// (Optional but recommended)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canManage, isOwner } = useAuth();

  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get("categoryId")
      ? Number(searchParams.get("categoryId"))
      : undefined
  );
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<ProductRequest>>({});

  const { data, isLoading } = useProducts({
    keyword: keyword || undefined,
    categoryId,
    page,
    size: 20,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>

        {canManage && (
          <Button onClick={() => setShowForm(!showForm)}>
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
            <form
              onSubmit={handleCreate}
              className="grid gap-4 md:grid-cols-3"
            >
              <Input
                required
                placeholder="Name *"
                value={formData.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
              />

              <Input
                placeholder="Barcode"
                value={formData.barcode ?? ""}
                onChange={(e) => set("barcode", e.target.value)}
              />

              <Select
                value={formData.categoryId?.toString() ?? ""}
                onValueChange={(v) => set("categoryId", Number(v))}
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
                value={formData.costPrice ?? ""}
                onChange={(e) => set("costPrice", Number(e.target.value))}
              />

              <Input
                required
                type="number"
                step="0.01"
                placeholder="Selling price *"
                value={formData.sellingPrice ?? ""}
                onChange={(e) => set("sellingPrice", Number(e.target.value))}
              />

              <Input
                placeholder="Description"
                value={formData.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
              />

              <div className="col-span-full flex gap-2">
                <Button type="submit" disabled={createProduct.isPending}>
                  {createProduct.isPending ? "Saving…" : "Create"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>

                {createProduct.isError && (
                  <span className="text-sm text-red-500">
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
          value={categoryId?.toString() ?? ""}
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
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {["Name", "Barcode", "Category", "Cost", "Price", "Status", "Actions"].map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {data?.content.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <button
                        onClick={() => router.push(`/dashboard/products/${p.id}`)}
                        className="font-medium text-primary underline"
                      >
                        {p.name}
                      </button>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {p.barcode ?? "—"}
                    </TableCell>

                    <TableCell>{p.category?.name ?? "—"}</TableCell>

                    <TableCell>
                      ${Number(p.costPrice).toFixed(2)}
                    </TableCell>

                    <TableCell className="font-medium">
                      ${Number(p.sellingPrice).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      <Badge variant={p.isActive ? "default" : "destructive"}>
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => deleteProduct.mutate(p.id)}
                          disabled={deleteProduct.isPending}
                        >
                          Deactivate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Button
            variant="outline"
            size="sm"
            disabled={data.first}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </Button>

          <span>
            Page {data.page + 1} of {data.totalPages} ({data.totalElements} products)
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={data.last}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
