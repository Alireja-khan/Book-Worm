import { NextResponse } from 'next/server'
import connectDb from '@/lib/db';
import Genre from '@/model/Genre.model';

export async function GET() {
  try {
    await connectDb();
    
    const genres = await Genre.find({}).select('_id name description').sort({ name: 1 });
    
    return NextResponse.json({ 
      success: true,
      genres 
    });
  } catch (error) {
    console.error('Error fetching genres:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch genres' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDb();
    
    const data = await request.json();
    const { name, description } = data;
    
    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Genre name is required' },
        { status: 400 }
      );
    }
    
    // Check if genre already exists (case insensitive)
    const existingGenre = await Genre.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    
    if (existingGenre) {
      return NextResponse.json(
        { success: false, error: 'A genre with this name already exists' },
        { status: 409 }
      );
    }
    
    const newGenre = await Genre.create({ 
      name: name.trim(), 
      description: description?.trim() || undefined 
    });
    
    return NextResponse.json({ 
      success: true, 
      genre: newGenre,
      message: 'Genre created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating genre:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, error: 'Invalid genre data provided' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create genre' },
      { status: 500 }
    );
  }
}
