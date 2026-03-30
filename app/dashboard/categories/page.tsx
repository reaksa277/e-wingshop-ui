'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryFormData,
} from '@/app/actions/categories';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deletingCategory, setDeletingCategory] = useState<any>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Category created successfully!');
        setIsAddDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        resetForm();
      } else {
        toast.error(result.error || 'Failed to create category');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryFormData> }) =>
      updateCategory(id, data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Category updated successfully!');
        setEditingCategory(null);
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        resetForm();
      } else {
        toast.error(result.error || 'Failed to update category');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Category deleted successfully!');
        setDeletingCategory(null);
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      } else {
        toast.error(result.error || 'Failed to delete category');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (deletingCategory) {
      deleteMutation.mutate(deletingCategory.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage product categories</p>
        </div>
        <Dialog
          open={isAddDialogOpen || !!editingCategory}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              setEditingCategory(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-106.25">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? 'Update category information.'
                    : 'Create a new product category.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Dairy Products"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of this category..."
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingCategory(null);
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingCategory
                      ? 'Update'
                      : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : categoriesData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No categories found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                categoriesData?.data?.map((category: any, index: number) => (
                  <TableRow key={category?.id || category?.name || `cat-${index}`}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-muted-foreground truncate">
                        {category.description || '—'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{category.productCount || 0} products</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingCategory(category)}
                          disabled={category.productCount && category.productCount > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category &quot;
              {deletingCategory?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
