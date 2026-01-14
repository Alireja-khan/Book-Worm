'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';

interface Genre {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  bookCount: number;
  createdAt: string;
}

export default function AdminGenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/genres');
      const data = await response.json();
      
      if (data.success) {
        setGenres(data.genres || []);
      } else {
        toast.error('Failed to fetch genres');
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
      toast.error('Error loading genres');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Genre name is required');
      return;
    }

    try {
      const method = editingGenre ? 'PUT' : 'POST';
      const url = editingGenre ? `/api/genres/${editingGenre._id}` : '/api/genres';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim()
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingGenre ? 'Genre updated successfully!' : 'Genre created successfully!');
        setOpen(false);
        resetForm();
        fetchGenres();
      } else {
        toast.error(result.error || `Failed to ${editingGenre ? 'update' : 'create'} genre`);
      }
    } catch (error) {
      console.error(`Error ${editingGenre ? 'updating' : 'creating'} genre:`, error);
      toast.error(`Failed to ${editingGenre ? 'update' : 'create'} genre. Please try again.`);
    }
  };

  const handleDelete = async (genreId: string, genreName: string) => {
    if (!confirm(`Are you sure you want to delete the genre "${genreName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/genres/${genreId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Genre deleted successfully!');
        fetchGenres();
      } else {
        toast.error(result.error || 'Failed to delete genre');
      }
    } catch (error) {
      console.error('Error deleting genre:', error);
      toast.error('Failed to delete genre');
    }
  };

  const handleEdit = (genre: Genre) => {
    setEditingGenre(genre);
    setFormData({
      name: genre.name,
      description: genre.description || ''
    });
    setOpen(true);
  };

  const resetForm = () => {
    setEditingGenre(null);
    setFormData({
      name: '',
      description: ''
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Genres</h1>
          <p className="text-muted-foreground">
            Create and manage book genres for categorization.
          </p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Genre
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingGenre ? 'Edit Genre' : 'Create New Genre'}</DialogTitle>
              <DialogDescription>
                {editingGenre 
                  ? 'Update the genre details below.' 
                  : 'Add a new genre to categorize books.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Genre Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter genre name"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.name.length}/50 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter genre description (optional)"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/500 characters
                  </p>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingGenre ? 'Update Genre' : 'Create Genre'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Genres ({genres.length})</CardTitle>
          <CardDescription>
            Manage all book genres in your library.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading genres...</span>
            </div>
          ) : genres.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No genres found</h3>
              <p className="mt-2 text-muted-foreground">
                Get started by creating your first genre.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Books</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {genres.map((genre) => (
                  <TableRow key={genre._id}>
                    <TableCell className="font-medium">{genre.name}</TableCell>
                    <TableCell>
                      {genre.description ? (
                        <span className="text-muted-foreground">{genre.description}</span>
                      ) : (
                        <span className="text-muted-foreground italic">No description</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <BookOpen className="mr-1 h-3 w-3" />
                        {genre.bookCount} {genre.bookCount === 1 ? 'book' : 'books'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{genre.slug}</code>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(genre)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(genre._id, genre.name)}
                          disabled={genre.bookCount > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
