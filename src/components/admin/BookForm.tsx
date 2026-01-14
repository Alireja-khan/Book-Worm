'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, AlertCircle, Loader2, BookOpen, User, FileText, Hash, Calendar, Building } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface Genre {
  _id: string;
  name: string;
}

interface BookFormProps {
  bookId?: string;
}

export function BookForm({ bookId }: BookFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
    pages: 0,
    publicationYear: new Date().getFullYear(),
    publisher: '',
    isbn: '',
    coverImage: null as File | null,
    coverImagePreview: '',
  });
  const [genres, setGenres] = useState<Genre[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!!bookId);
  const [fetchingBook, setFetchingBook] = useState(!!bookId);
  const [fetchingGenres, setFetchingGenres] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchGenres();
    if (bookId) {
      fetchBookDetails();
    }
  }, [bookId]);

  const fetchGenres = async () => {
    try {
      setFetchingGenres(true);
      console.log('Fetching genres...');
      const response = await fetch(`/api/genres?t=${Date.now()}`);
      console.log('Genres response status:', response.status);
      const data = await response.json();
      console.log('Genres response data:', data);
      
      // Handle different response structures
      let genresData = [];
      
      // Log the raw response for debugging
      console.log('Raw API response:', data);
      
      if (data.success) {
        // API returns { success: true, genres: [...] }
        genresData = data.genres || [];
        console.log('Using data.genres:', genresData);
      } else if (data.data) {
        // Alternative structure { data: [...] }
        genresData = data.data || [];
        console.log('Using data.data:', genresData);
      } else if (data.genres) {
        // Direct genres array { genres: [...] }
        genresData = data.genres || [];
        console.log('Using data.genres (direct):', genresData);
      } else if (Array.isArray(data)) {
        // Raw array response [...]
        genresData = data;
        console.log('Using raw array:', genresData);
      } else {
        // Fallback
        genresData = [];
        console.log('No recognizable data structure found');
      }
      
      console.log('Processed genres:', genresData);
      setGenres(genresData);
    } catch (error) {
      console.error('Error fetching genres:', error);
      toast.error('Failed to load genres');
    } finally {
      setFetchingGenres(false);
    }
  };

  const fetchBookDetails = async () => {
    if (!bookId) return;
    
    try {
      setFetchingBook(true);
      const response = await fetch(`/api/books/${bookId}`);
      const data = await response.json();
      
      if (data.success) {
        const book = data.data;
        
        // Extract genre ID - handle both object and string formats
        let genreId = '';
        if (book.genre) {
          if (typeof book.genre === 'object' && book.genre._id) {
            genreId = book.genre._id;
          } else if (typeof book.genre === 'string') {
            genreId = book.genre;
          }
        }
        
        setFormData({
          title: book.title || '',
          author: book.author || '',
          description: book.description || '',
          genre: genreId,
          pages: book.pages || 0,
          publicationYear: book.publicationYear || new Date().getFullYear(),
          publisher: book.publisher || '',
          isbn: book.isbn || '',
          coverImage: null,
          coverImagePreview: book.coverImage || '',
        });
      } else {
        toast.error('Book not found');
        router.push('/admin/books');
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      toast.error('Failed to load book details');
      router.push('/admin/books');
    } finally {
      setFetchingBook(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Year') || name.includes('pages') ? parseInt(value) || 0 : value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, genre: value }));
    if (errors.genre) {
      setErrors(prev => ({ ...prev, genre: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', e.target.files);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('Selected file:', file.name, file.size, file.type);
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, coverImage: 'File size must be less than 5MB' }));
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, coverImage: 'File must be an image' }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        coverImage: file,
        coverImagePreview: URL.createObjectURL(file)
      }));
      
      // Clear image error
      if (errors.coverImage) {
        setErrors(prev => ({ ...prev, coverImage: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    else if (formData.title.length > 200) newErrors.title = 'Title must be less than 200 characters';
    
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    else if (formData.author.length > 100) newErrors.author = 'Author name must be less than 100 characters';
    
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    else if (formData.description.length > 2000) newErrors.description = 'Description must be less than 2000 characters';
    
    // Temporarily disable genre requirement for testing
    // if (!formData.genre) newErrors.genre = 'Genre is required';
    
    if (formData.pages <= 0) newErrors.pages = 'Pages must be greater than 0';
    else if (formData.pages > 10000) newErrors.pages = 'Page count is too high';
    
    const currentYear = new Date().getFullYear();
    if (formData.publicationYear < 1000) newErrors.publicationYear = 'Please enter a valid year';
    else if (formData.publicationYear > currentYear + 1) newErrors.publicationYear = `Year cannot be later than ${currentYear + 1}`;
    
    if (!formData.coverImage && !formData.coverImagePreview) {
      newErrors.coverImage = 'Cover image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('author', formData.author.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('genre', formData.genre);
      formDataToSend.append('pages', formData.pages.toString());
      formDataToSend.append('publicationYear', formData.publicationYear.toString());
      
      if (formData.publisher.trim()) {
        formDataToSend.append('publisher', formData.publisher.trim());
      }
      
      if (formData.isbn.trim()) {
        formDataToSend.append('isbn', formData.isbn.trim());
      }
      
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage);
      }

      const url = bookId 
        ? `/api/books/${bookId}` 
        : '/api/books';
      const method = bookId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(bookId ? 'Book updated successfully!' : 'Book created successfully!');
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/admin/books');
          router.refresh(); // Refresh the page to show updated data
        }, 1000);
      } else {
        toast.error(result.error || `Failed to ${bookId ? 'update' : 'create'} book`);
      }
    } catch (error) {
      console.error(`Error ${bookId ? 'updating' : 'creating'} book:`, error);
      toast.error(`Failed to ${bookId ? 'update' : 'create'} book. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching
  if (fetchingBook || fetchingGenres) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isEditing ? 'Edit Book' : 'Add New Book'}
          </CardTitle>
          <CardDescription>
            {isEditing ? 'Update the book details below.' : 'Fill in the details to add a new book to the library.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cover Image Upload */}
          <div className="space-y-4">
            <Label htmlFor="coverImage" className="text-base">Cover Image *</Label>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Image Preview */}
              <div className="lg:col-span-1">
                <div className="relative w-full aspect-[3/4] border-2 border-dashed rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center">
                  {formData.coverImagePreview ? (
                    <Image
                      src={formData.coverImagePreview}
                      alt="Book cover preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No cover image</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Upload Controls */}
              <div className="lg:col-span-2 space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors bg-muted/20">
                  <div className="space-y-4">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Drag and drop or click to upload
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Recommended: 400×600 pixels
                      </p>
                    </div>
                    
                    {/* Hidden file input */}
                    <input 
                      id="coverImage" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    
                    {/* Visible button that triggers the hidden input */}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('coverImage')?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                </div>
                
                {errors.coverImage && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.coverImage}
                  </p>
                )}
              </div>
            </div>
          </div>


          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Title *
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter book title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Author *
              </Label>
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Enter author name"
                className={errors.author ? 'border-red-500' : ''}
              />
              {errors.author && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.author}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description *
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter book description..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center">
              {errors.description ? (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {formData.description.length}/2000 characters
                </p>
              )}
            </div>
          </div>

          {/* Genre & Pages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre *</Label>
              {genres.length === 0 && !fetchingGenres && (
                <div className="space-y-2">
                  <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-md">
                    ⚠️ No genres found. Please add genres in the admin panel first.
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchGenres}
                    className="text-xs"
                  >
                    Refresh Genres
                  </Button>
                </div>
              )}
              <Select 
                value={formData.genre} 
                onValueChange={handleSelectChange}
                disabled={fetchingGenres || genres.length === 0}
              >
                <SelectTrigger className={`${errors.genre ? 'border-red-500' : ''} ${fetchingGenres ? 'opacity-50' : ''}`}>
                  <SelectValue placeholder={fetchingGenres ? "Loading genres..." : "Select a genre"} />
                </SelectTrigger>
                <SelectContent>
                  {genres.length === 0 ? (
                    <SelectItem value="no-genres" disabled>
                      {fetchingGenres ? "Loading..." : "No genres available. Please add genres first."}
                    </SelectItem>
                  ) : (
                    genres.map(genre => (
                      <SelectItem key={genre._id} value={genre._id}>
                        {genre.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.genre && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.genre}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pages">Pages *</Label>
              <Input
                id="pages"
                name="pages"
                type="number"
                value={formData.pages}
                onChange={handleChange}
                min="1"
                max="10000"
                placeholder="Enter number of pages"
                className={errors.pages ? 'border-red-500' : ''}
              />
              {errors.pages && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.pages}
                </p>
              )}
            </div>
          </div>

          {/* Publication Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="publicationYear" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Publication Year *
              </Label>
              <Input
                id="publicationYear"
                name="publicationYear"
                type="number"
                value={formData.publicationYear}
                onChange={handleChange}
                min="1000"
                max={new Date().getFullYear() + 1}
                placeholder="Enter publication year"
                className={errors.publicationYear ? 'border-red-500' : ''}
              />
              {errors.publicationYear && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.publicationYear}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="publisher" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Publisher
              </Label>
              <Input
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                placeholder="Enter publisher name (optional)"
              />
            </div>
          </div>

          {/* ISBN */}
          <div className="space-y-2">
            <Label htmlFor="isbn" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              ISBN
            </Label>
            <Input
              id="isbn"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="Enter ISBN (optional)"
            />
            <p className="text-sm text-muted-foreground">
              International Standard Book Number (optional)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-between items-center">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        
        <Button 
          type="submit" 
          disabled={loading}
          className="min-w-[140px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{isEditing ? 'Update Book' : 'Create Book'}</>
          )}
        </Button>
      </div>
    </form>
  );
}