'use client';

import { BookForm } from '@/components/admin/BookForm';

export default function AdminEditBookPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Book</h1>
        <p className="text-muted-foreground">
          Update the details for this book.
        </p>
      </div>
      <BookForm bookId={params.id} />
    </div>
  );
}
