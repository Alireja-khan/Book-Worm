'use client';

import { BookForm } from '@/components/admin/BookForm';

export default function AdminNewBookPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Book</h1>
        <p className="text-muted-foreground">
          Add a new book to the library.
        </p>
      </div>
      <BookForm />
    </div>
  );
}
