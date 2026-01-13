// src/app/api/auth/register/route.ts
import connectDb from "@/lib/db";
import User from "@/model/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import uploadOnCloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const imageFile = formData.get('image') as File | null;

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Name, email, and password are required!" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: "Invalid email format!" },
                { status: 400 }
            );
        }

        await connectDb();

        // Check if user already exists
        const existUser = await User.findOne({ email });
        if (existUser) {
            return NextResponse.json(
                { message: "An account with this email already exists!" },
                { status: 409 }
            );
        }

        // Validate password
        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters long!" },
                { status: 400 }
            );
        }

        // Upload image to Cloudinary if provided
        let imageUrl = "";
        if (imageFile && imageFile.size > 0) {
            const image = await uploadOnCloudinary(imageFile);
            if (image) {
                imageUrl = image;
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            image: imageUrl,
            role: 'user',
            isActive: true,
            lastLogin: new Date(),
            readingStats: {
                totalBooksRead: 0,
                totalPagesRead: 0,
                averageRating: 0,
                favoriteGenres: [],
                currentStreak: 0,
                longestStreak: 0,
            },
            preferences: {
                favoriteGenres: [],
                notificationEnabled: true,
            },
        });

        // Return user data without password
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
        };

        return NextResponse.json(
            { 
                message: "Account created successfully!",
                user: userResponse
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { 
                message: "Failed to create account. Please try again.",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}