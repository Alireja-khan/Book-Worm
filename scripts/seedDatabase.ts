// scripts/seedDatabase.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '@/model/Book.model';
import Genre from '@/model/Genre.model';
import path from 'path';

dotenv.config();



// Genre data
const genresData = [
  { name: 'Fiction', description: 'Works of imagination' },
  { name: 'Non-Fiction', description: 'Factual literature' },
  { name: 'Mystery', description: 'Crime and detective stories' },
  { name: 'Science Fiction', description: 'Futuristic and scientific themes' },
  { name: 'Fantasy', description: 'Magic and supernatural elements' },
  { name: 'Romance', description: 'Love and relationships' },
  { name: 'Biography', description: 'Life stories of real people' },
  { name: 'History', description: 'Historical events and periods' },
  { name: 'Self-Help', description: 'Personal development' },
  { name: 'Young Adult', description: 'Books for teenagers' },
];

// Book data - Complete 30 books
const booksData = [
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    description: "A mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/18144590.jpg",
    pages: 208,
    publicationYear: 1988,
    publisher: "HarperOne",
    isbn: "9780062315007",
    averageRating: 3.9,
    totalReviews: 250,
    totalShelves: 1500,
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description: "A practical guide to building good habits and breaking bad ones with tiny changes.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1535115320i/40121378.jpg",
    pages: 320,
    publicationYear: 2018,
    publisher: "Avery",
    isbn: "9780735211292",
    averageRating: 4.4,
    totalReviews: 180,
    totalShelves: 1200,
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    description: "The first book in the Harry Potter series where a young wizard discovers his magical heritage.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1170803558i/72193.jpg",
    pages: 309,
    publicationYear: 1997,
    publisher: "Bloomsbury",
    isbn: "9780747532699",
    averageRating: 4.5,
    totalReviews: 780,
    totalShelves: 2500,
  },
  {
    title: "1984",
    author: "George Orwell",
    description: "A dystopian social science fiction novel about totalitarian regime and thought control.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657781256i/61439040.jpg",
    pages: 328,
    publicationYear: 1949,
    publisher: "Secker & Warburg",
    isbn: "9780451524935",
    averageRating: 4.2,
    totalReviews: 420,
    totalShelves: 1800,
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "A novel about racial injustice and the loss of innocence in the American South.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg",
    pages: 324,
    publicationYear: 1960,
    publisher: "J.B. Lippincott & Co.",
    isbn: "9780061120084",
    averageRating: 4.3,
    totalReviews: 560,
    totalShelves: 2000,
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A story about the American dream, wealth, and love during the Jazz Age.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg",
    pages: 180,
    publicationYear: 1925,
    publisher: "Charles Scribner's Sons",
    isbn: "9780743273565",
    averageRating: 3.9,
    totalReviews: 320,
    totalShelves: 1700,
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "A romantic novel of manners that depicts the emotional development of protagonist Elizabeth Bennet.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg",
    pages: 432,
    publicationYear: 1813,
    publisher: "T. Egerton, Whitehall",
    isbn: "9780141439518",
    averageRating: 4.3,
    totalReviews: 380,
    totalShelves: 1900,
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    description: "A fantasy novel about the adventures of hobbit Bilbo Baggins in Middle-earth.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg",
    pages: 310,
    publicationYear: 1937,
    publisher: "George Allen & Unwin",
    isbn: "9780261102217",
    averageRating: 4.3,
    totalReviews: 290,
    totalShelves: 1600,
  },
  {
    title: "The Da Vinci Code",
    author: "Dan Brown",
    description: "A mystery thriller novel about a conspiracy within the Catholic Church.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1579621267i/968.jpg",
    pages: 489,
    publicationYear: 2003,
    publisher: "Doubleday",
    isbn: "9780307277671",
    averageRating: 3.9,
    totalReviews: 670,
    totalShelves: 2200,
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    description: "A story about teenage alienation and loss of innocence.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg",
    pages: 277,
    publicationYear: 1951,
    publisher: "Little, Brown and Company",
    isbn: "9780316769488",
    averageRating: 3.8,
    totalReviews: 310,
    totalShelves: 1400,
  },
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    description: "A psychological thriller about a woman who shoots her husband and then stops speaking.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1582759969i/40097951.jpg",
    pages: 336,
    publicationYear: 2019,
    publisher: "Celadon Books",
    isbn: "9781250301697",
    averageRating: 4.1,
    totalReviews: 450,
    totalShelves: 1200,
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    description: "A book about the two systems that drive the way we think.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1317793965i/11468377.jpg",
    pages: 499,
    publicationYear: 2011,
    publisher: "Farrar, Straus and Giroux",
    isbn: "9780374275631",
    averageRating: 4.2,
    totalReviews: 320,
    totalShelves: 1100,
  },
  {
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    description: "A business and self-help book offering lessons for personal change.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1668440082i/36072.jpg",
    pages: 372,
    publicationYear: 1989,
    publisher: "Free Press",
    isbn: "9780743269513",
    averageRating: 4.2,
    totalReviews: 280,
    totalShelves: 1300,
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    description: "A science fiction novel set in the distant future amidst a feudal interstellar society.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg",
    pages: 412,
    publicationYear: 1965,
    publisher: "Chilton Books",
    isbn: "9780441172719",
    averageRating: 4.3,
    totalReviews: 390,
    totalShelves: 1400,
  },
  {
    title: "Educated",
    author: "Tara Westover",
    description: "A memoir about a woman who leaves her survivalist family and goes on to earn a PhD.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1506026635i/35133922.jpg",
    pages: 334,
    publicationYear: 2018,
    publisher: "Random House",
    isbn: "9780399590504",
    averageRating: 4.5,
    totalReviews: 290,
    totalShelves: 1000,
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    description: "A novel about a library that contains books that let you experience the lives you could have lived.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1602190253i/52578297.jpg",
    pages: 304,
    publicationYear: 2020,
    publisher: "Viking",
    isbn: "9780525559474",
    averageRating: 4.0,
    totalReviews: 350,
    totalShelves: 1300,
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    description: "A science fiction novel about a high school science teacher who wakes up on a spaceship.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1597695864i/54493401.jpg",
    pages: 476,
    publicationYear: 2021,
    publisher: "Ballantine Books",
    isbn: "9780593135204",
    averageRating: 4.5,
    totalReviews: 420,
    totalShelves: 1500,
  },
  {
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    description: "A murder mystery and coming-of-age story set in the marshes of North Carolina.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1582135294i/36809135.jpg",
    pages: 384,
    publicationYear: 2018,
    publisher: "G.P. Putnam's Sons",
    isbn: "9780735219090",
    averageRating: 4.5,
    totalReviews: 510,
    totalShelves: 1800,
  },
  {
    title: "The Four Agreements",
    author: "Don Miguel Ruiz",
    description: "A practical guide to personal freedom based on ancient Toltec wisdom.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1630528563i/6596.jpg",
    pages: 160,
    publicationYear: 1997,
    publisher: "Amber-Allen Publishing",
    isbn: "9781878424310",
    averageRating: 4.2,
    totalReviews: 220,
    totalShelves: 900,
  },
  {
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    description: "A self-help book that advises people to accept their limitations and focus on what matters.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1465761302i/28257707.jpg",
    pages: 224,
    publicationYear: 2016,
    publisher: "HarperOne",
    isbn: "9780062457714",
    averageRating: 3.9,
    totalReviews: 380,
    totalShelves: 1200,
  },
  {
    title: "It Ends With Us",
    author: "Colleen Hoover",
    description: "A romance novel about Lily Bloom and her relationship with Ryle Kincaid.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1470427482i/27362503.jpg",
    pages: 384,
    publicationYear: 2016,
    publisher: "Atria Books",
    isbn: "9781501110368",
    averageRating: 4.3,
    totalReviews: 520,
    totalShelves: 1600,
  },
  {
    title: "The Girl on the Train",
    author: "Paula Hawkins",
    description: "A psychological thriller about a divorced woman who becomes entangled in a missing persons investigation.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490903702i/22557272.jpg",
    pages: 323,
    publicationYear: 2015,
    publisher: "Riverhead Books",
    isbn: "9781594633669",
    averageRating: 3.9,
    totalReviews: 410,
    totalShelves: 1300,
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    description: "A book exploring the history of human species from the Stone Age to the modern era.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1420585954i/23692271.jpg",
    pages: 443,
    publicationYear: 2011,
    publisher: "Harper",
    isbn: "9780062316097",
    averageRating: 4.4,
    totalReviews: 330,
    totalShelves: 1100,
  },
  {
    title: "The Hunger Games",
    author: "Suzanne Collins",
    description: "A dystopian novel set in a future where teenagers fight to the death in a televised event.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1586722975i/2767052.jpg",
    pages: 374,
    publicationYear: 2008,
    publisher: "Scholastic Press",
    isbn: "9780439023481",
    averageRating: 4.3,
    totalReviews: 670,
    totalShelves: 2000,
  },
  {
    title: "Becoming",
    author: "Michelle Obama",
    description: "A memoir by the former First Lady of the United States.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1528206996i/38746485.jpg",
    pages: 426,
    publicationYear: 2018,
    publisher: "Crown Publishing Group",
    isbn: "9781524763138",
    averageRating: 4.5,
    totalReviews: 290,
    totalShelves: 1400,
  },
  {
    title: "The Power of Now",
    author: "Eckhart Tolle",
    description: "A guide to spiritual enlightenment focusing on the importance of living in the present moment.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1665420669i/6708.jpg",
    pages: 236,
    publicationYear: 1997,
    publisher: "New World Library",
    isbn: "9781577314806",
    averageRating: 4.2,
    totalReviews: 240,
    totalShelves: 1000,
  },
  {
    title: "Circe",
    author: "Madeline Miller",
    description: "A retelling of the story of Circe, the witch from Homer's Odyssey.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1565909496i/35959740.jpg",
    pages: 393,
    publicationYear: 2018,
    publisher: "Little, Brown and Company",
    isbn: "9780316556347",
    averageRating: 4.3,
    totalReviews: 280,
    totalShelves: 1100,
  },
  {
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    description: "A story about an Artificial Friend who observes human behavior.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1599225805i/54120408.jpg",
    pages: 320,
    publicationYear: 2021,
    publisher: "Knopf",
    isbn: "9780593318171",
    averageRating: 4.0,
    totalReviews: 190,
    totalShelves: 800,
  },
  {
    title: "The Book Thief",
    author: "Markus Zusak",
    description: "A novel set in Nazi Germany, narrated by Death, about a girl who steals books.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1522157426i/19063.jpg",
    pages: 552,
    publicationYear: 2005,
    publisher: "Picador",
    isbn: "9780375842207",
    averageRating: 4.4,
    totalReviews: 460,
    totalShelves: 1700,
  },
  {
    title: "The Road",
    author: "Cormac McCarthy",
    description: "A post-apocalyptic novel about a father and son traveling through a ravaged America.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1600249698i/6288.jpg",
    pages: 287,
    publicationYear: 2006,
    publisher: "Knopf",
    isbn: "9780307265432",
    averageRating: 3.9,
    totalReviews: 320,
    totalShelves: 1200,
  },
  {
    title: "Normal People",
    author: "Sally Rooney",
    description: "A novel about the complex relationship between two Irish teenagers.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1571423190i/41057294.jpg",
    pages: 273,
    publicationYear: 2018,
    publisher: "Hogarth Press",
    isbn: "9781984822178",
    averageRating: 3.8,
    totalReviews: 270,
    totalShelves: 900,
  },
];

// Helper function moved inside seedDatabase
function getRandomGenre(genreNames: string[], bookTitle: string): string {
  // Simple hash based on book title for consistent genre assignment
  const hash = bookTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return genreNames[hash % genreNames.length];
}

async function seedDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Book.deleteMany({});
    await Genre.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert genres
    const insertedGenres = await Genre.insertMany(genresData);
    console.log(`✅ Inserted ${insertedGenres.length} genres`);

    // Create genre map for easy reference
    const genreMap: Record<string, any> = {};
    insertedGenres.forEach((genre: any) => {
      genreMap[genre.name] = genre._id;
    });

    const genreNames = Object.keys(genreMap);
    
    // Assign random genres to books
    const booksWithGenres = booksData.map(book => ({
      ...book,
      genre: genreMap[getRandomGenre(genreNames, book.title)],
    }));

    // Insert books
    const insertedBooks = await Book.insertMany(booksWithGenres);
    console.log(`✅ Inserted ${insertedBooks.length} books`);

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Genres: ${insertedGenres.length}`);
    console.log(`   - Books: ${insertedBooks.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();