// src/components/books/AddBookButton.tsx
'use client';

import { useState } from 'react';
import { Plus, Upload, X, BookOpen, User, Hash, Calendar, Building, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import Image from 'next/image';

interface Genre {
  _id: string;
  name: string;
}

interface AddBookButtonProps {
  genres: Genre[];
  onBookAdded: () => void;
  userRole: 'user' | 'admin';
}

export default function AddBookForm({ genres, onBookAdded, userRole }: AddBookButtonProps) {
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
    pages: '',
    publicationYear: new Date().getFullYear().toString(),
    publisher: '',
    isbn: '',
  });

  const isAdmin = userRole === 'admin';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setCoverImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setCoverImage(null);
    setImagePreview('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Required fields
    if (!formData.title.trim()) {
      toast.error('Book title is required');
      return false;
    }
    if (!formData.author.trim()) {
      toast.error('Author name is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Book description is required');
      return false;
    }
    if (!formData.genre) {
      toast.error('Please select a genre');
      return false;
    }
    if (!formData.pages || parseInt(formData.pages) < 1) {
      toast.error('Please enter a valid number of pages');
      return false;
    }
    if (!formData.publicationYear) {
      toast.error('Publication year is required');
      return false;
    }
    if (!coverImage) {
      toast.error('Please upload a cover image');
      return false;
    }

    // Validate description length
    if (formData.description.length < 10) {
      toast.error('Description should be at least 10 characters');
      return false;
    }

    // Validate publication year
    const currentYear = new Date().getFullYear();
    const year = parseInt(formData.publicationYear);
    if (year < 1000 || year > currentYear + 1) {
      toast.error(`Publication year must be between 1000 and ${currentYear + 1}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('author', formData.author.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('genre', formData.genre);
      formDataToSend.append('pages', formData.pages);
      formDataToSend.append('publicationYear', formData.publicationYear);
      if (formData.publisher.trim()) formDataToSend.append('publisher', formData.publisher.trim());
      if (formData.isbn.trim()) formDataToSend.append('isbn', formData.isbn.trim());
      formDataToSend.append('coverImage', coverImage!);
      formDataToSend.append('userRole', userRole); // Send user role to API

      // Send to API
      const response = await fetch('/api/books', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit book');
      }

      if (isAdmin) {
        toast.success('Book added successfully! It is now available in the library.');
      } else {
        toast.success('Book submitted successfully! It will be reviewed by an admin within 24-48 hours.');
      }
      
      // Reset form
      resetForm();
      
      // Refresh book list
      onBookAdded();
      
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit book');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      genre: '',
      pages: '',
      publicationYear: new Date().getFullYear().toString(),
      publisher: '',
      isbn: '',
    });
    setCoverImage(null);
    setImagePreview('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-card rounded-xl border border-border p-6 shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Plus className="w-6 h-6" />
          {isAdmin ? 'Add New Book' : 'Submit Book for Review'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isAdmin 
            ? 'As an admin, your books will be published immediately.'
            : 'Your book will be reviewed by an admin before publishing.'}
        </p>
      </div>
      
      {/* Admin/User Notice */}
      {!isAdmin && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-300">Submission Process</p>
              <ul className="mt-1 space-y-1 text-amber-700 dark:text-amber-400">
                <li>• Your book will be reviewed by an admin</li>
                <li>• Review usually takes 24-48 hours</li>
                <li>• You will be notified once approved</li>
                <li>• Please ensure all information is accurate</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Book Cover Image */}
        <div className="space-y-3">
          <Label htmlFor="coverImage" className="text-sm font-medium flex items-center gap-1">
            Book Cover <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-col items-center gap-4">
            {imagePreview ? (
              <div className="relative">
                <div className="w-48 h-64 rounded-lg overflow-hidden border-2 border-border shadow-lg">
                  <Image
                    src={imagePreview}
                    alt="Book cover preview"
                    width={192}
                    height={256}
                    className="object-cover w-full h-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg hover:bg-destructive/90 transition-colors"
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-48 h-64 rounded-lg bg-secondary/30 border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => document.getElementById('coverImage')?.click()}
              >
                <Upload className="w-12 h-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">Upload Cover</p>
                  <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, GIF, WebP</p>
                  <p className="text-xs text-muted-foreground">Max 5MB</p>
                </div>
              </div>
            )}
            
            <input
              type="file"
              id="coverImage"
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              required
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('coverImage')?.click()}
              disabled={loading}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {imagePreview ? 'Change Image' : 'Select Image'}
            </Button>
          </div>
        </div>

        {/* Title & Author */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium flex items-center gap-1">
              Book Title <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="title"
                name="title"
                placeholder="Enter book title"
                className="pl-10"
                value={formData.title}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author" className="text-sm font-medium flex items-center gap-1">
              Author <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="author"
                name="author"
                placeholder="Enter author name"
                className="pl-10"
                value={formData.author}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Genre & Pages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="genre" className="text-sm font-medium flex items-center gap-1">
              Genre <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.genre}
              onValueChange={(value) => handleSelectChange('genre', value)}
              required
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre._id} value={genre._id}>
                    {genre.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pages" className="text-sm font-medium flex items-center gap-1">
              Pages <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="pages"
                name="pages"
                type="number"
                min="1"
                placeholder="Enter total pages"
                className="pl-10"
                value={formData.pages}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Publication Year & Publisher */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="publicationYear" className="text-sm font-medium flex items-center gap-1">
              Publication Year <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="publicationYear"
                name="publicationYear"
                type="number"
                min="1000"
                max={new Date().getFullYear() + 1}
                placeholder="e.g., 2023"
                className="pl-10"
                value={formData.publicationYear}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publisher" className="text-sm font-medium">
              Publisher (Optional)
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="publisher"
                name="publisher"
                placeholder="Enter publisher name"
                className="pl-10"
                value={formData.publisher}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* ISBN */}
        <div className="space-y-2">
          <Label htmlFor="isbn" className="text-sm font-medium">
            ISBN (Optional)
          </Label>
          <Input
            id="isbn"
            name="isbn"
            placeholder="Enter ISBN number"
            value={formData.isbn}
            onChange={handleInputChange}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            International Standard Book Number (e.g., 978-3-16-148410-0)
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium flex items-center gap-1">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter book description. Include plot summary, themes, and any relevant details..."
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            required
            disabled={loading}
            className="resize-none min-h-[120px]"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Minimum 10 characters</span>
            <span className={formData.description.length > 2000 ? 'text-destructive' : ''}>
              {formData.description.length}/2000 characters
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={loading}
          >
            Reset Form
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className={isAdmin ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                {isAdmin ? 'Adding Book...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {isAdmin ? 'Add Book' : 'Submit for Review'}
              </>
            )}
          </Button>
        </div>

        {/* Form Guidelines */}
        <div className="text-xs text-muted-foreground border-t border-border pt-4">
          <p className="font-medium mb-1">Submission Guidelines:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>All fields marked with * are required</li>
            <li>Provide accurate and complete information</li>
            <li>Use high-quality cover images (5MB max)</li>
            <li>Write detailed descriptions (10-2000 characters)</li>
            {!isAdmin && <li>Your submission will be reviewed by an admin</li>}
          </ul>
        </div>
      </form>
    </div>
  );
}