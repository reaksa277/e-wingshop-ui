"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  useProduct, 
  useUpdateProduct, 
  useDeleteProduct, 
  useCategories 
} from "@/hooks";
import { useAuth } from "@/lib/auth-context";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Assets & Types
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { 
  ChevronLeft, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  ExternalLink, 
  Save, 
  X 
} from "lucide-react";
import type { ProductRequest } from "@/types";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const productId = Number(id);
  const { canManage, isOwner } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<ProductRequest>>({});

  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);
  const { data: categories } = useCategories();
  const updateProduct = useUpdateProduct(productId);
  const deleteProduct = useDeleteProduct();

  if (isLoading) return (
    <div className="space-y-6">
      <div className="h-10 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
  if (isError) return <ErrorMessage error={error} retry={refetch} />;
  if (!product) return <ErrorMessage error={new Error("Product not found")} />;

  const set = (key: keyof ProductRequest, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    const merged: ProductRequest = {
      name: form.name ?? product!.name,
      description: form.description ?? product!.description,
      barcode: form.barcode !== undefined ? form.barcode : product!.barcode,
      imageUrl: form.imageUrl !== undefined ? form.imageUrl : product!.imageUrl,
      categoryId: form.categoryId ?? product!.category?.id ?? 0,
      costPrice: form.costPrice ?? product!.costPrice,
      sellingPrice: form.sellingPrice ?? product!.sellingPrice,
      isActive: form.isActive !== undefined ? form.isActive : product!.isActive,
    };
    await updateProduct.mutateAsync(merged);
    setEditMode(false);
    setForm({});
  }

  async function handleDelete() {
    if (!confirm(`Deactivate "${product!.name}"?`)) return;
    await deleteProduct.mutateAsync(productId);
    router.push("/dashboard/products");
  }

  const margin = product!.sellingPrice > 0
    ? (((product!.sellingPrice - product!.costPrice) / product!.sellingPrice) * 100).toFixed(1)
    : "0";

  return (
    <div className="w-full space-y-6">
      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="pl-0 text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/dashboard/products")}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to products
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{product.name}</h2>
            <Badge variant={product.isActive ? "outline" : "destructive"}>
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {product.category?.name ?? "Uncategorized"} • Barcode: {product.barcode || "N/A"}
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <Button 
              variant={editMode ? "outline" : "default"} 
              onClick={() => { setEditMode(!editMode); setForm({}); }}
            >
              {editMode ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Edit3 className="mr-2 h-4 w-4" /> Edit Product</>}
            </Button>
            {isOwner && (
              <Button 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={deleteProduct.isPending || !product.isActive}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {product.isActive ? "Deactivate" : "Inactive"}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Inactive Banner */}
      {!product.isActive && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900">
          <AlertTriangle className="h-4 w-4 stroke-amber-900" />
          <AlertTitle>Product Inactive</AlertTitle>
          <AlertDescription>
            This product is currently hidden from the customer-facing storefront and cannot be added to new orders.
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Cost Price" value={`$${Number(product.costPrice).toFixed(2)}`} />
        <StatCard label="Selling Price" value={`$${Number(product.sellingPrice).toFixed(2)}`} color="text-green-600" />
        <StatCard label="Margin" value={`${margin}%`} color="text-violet-600" />
        <StatCard label="Created On" value={new Date(product.createdAt).toLocaleDateString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Area */}
        <div className="lg:col-span-2 space-y-6">
          {editMode ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Product Details</CardTitle>
                <CardDescription>Update your product information and pricing.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" required defaultValue={product.name} onChange={(e) => set("name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input id="barcode" defaultValue={product.barcode ?? ""} onChange={(e) => set("barcode", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select 
                        defaultValue={product.category?.id?.toString()} 
                        onValueChange={(val) => set("categoryId", Number(val))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select 
                        defaultValue={product.isActive ? "true" : "false"} 
                        onValueChange={(val) => set("isActive", val === "true")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost">Cost Price ($) *</Label>
                      <Input id="cost" type="number" step="0.01" defaultValue={product.costPrice} onChange={(e) => set("costPrice", Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="selling">Selling Price ($) *</Label>
                      <Input id="selling" type="number" step="0.01" defaultValue={product.sellingPrice} onChange={(e) => set("sellingPrice", Number(e.target.value))} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea id="desc" rows={4} defaultValue={product.description ?? ""} onChange={(e) => set("description", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input id="image" defaultValue={product.imageUrl ?? ""} onChange={(e) => set("imageUrl", e.target.value)} />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button type="submit" disabled={updateProduct.isPending}>
                      {updateProduct.isPending ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
                  </div>
                  {updateProduct.isError && <ErrorMessage error={updateProduct.error} />}
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem label="Full Name" value={product.name} className="md:col-span-2" />
                  <DetailItem label="Category" value={product.category?.name ?? "—"} />
                  <DetailItem label="Barcode" value={product.barcode ?? "—"} />
                  <DetailItem label="Last Updated" value={new Date(product.updatedAt || product.createdAt).toLocaleString()} />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap italic text-foreground/80">
                    {product.description || "No description provided for this product."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar / Media */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-muted-foreground text-sm">No image available</span>
                )}
              </div>
              {product.imageUrl && (
                <Button variant="link" className="w-full mt-2" asChild>
                  <a href={product.imageUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-3 w-3" /> View full size
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-foreground" }: { label: string; value: string; color?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-xs font-medium text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}