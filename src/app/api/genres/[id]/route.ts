import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Genre from '@/model/Genre.model';
import Book from '@/model/Book.model';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    
    const { id } = await params;
    const data = await request.json();
    const { name, description } = data;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Genre name is required' },
        { status: 400 }
      );
    }

    // Check if another genre with the same name exists
    const existingGenre = await Genre.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      _id: { $ne: id }
    });

    if (existingGenre) {
      return NextResponse.json(
        { success: false, error: 'A genre with this name already exists' },
        { status: 409 }
      );
    }

    // Update genre
    const updatedGenre = await Genre.findByIdAndUpdate(
      id,
      { 
        name: name.trim(),
        description: description?.trim() || undefined
      },
      { new: true, runValidators: true }
    );

    if (!updatedGenre) {
      return NextResponse.json(
        { success: false, error: 'Genre not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      genre: updatedGenre,
      message: 'Genre updated successfully'
    });

  } catch (error) {
    console.error('Error updating genre:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, error: 'Invalid genre data provided' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update genre' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    
    const { id } = await params;

    // Check if genre exists
    const genre = await Genre.findById(id);
    if (!genre) {
      return NextResponse.json(
        { success: false, error: 'Genre not found' },
        { status: 404 }
      );
    }

    // Check if genre has books associated with it
    const bookCount = await Book.countDocuments({ genre: id });
    if (bookCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete genre "${genre.name}" because it has ${bookCount} associated ${bookCount === 1 ? 'book' : 'books'}.` 
        },
        { status: 400 }
      );
    }

    // Delete the genre
    await Genre.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Genre "${genre.name}" deleted successfully`
    });

  } catch (error) {
    console.error('Error deleting genre:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete genre' },
      { status: 500 }
    );
  }
}