// src/app/api/auth/profile/route.ts
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import User from '@/model/user.model';
import uploadOnCloudinary from '@/lib/cloudinary';
import authOptions from '@/lib/auth';

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const name = formData.get('name') as string;
        const imageFile = formData.get('image') as File | null;

        await connectDb();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Update name if provided
        if (name && name !== user.name) {
            user.name = name;
        }

        // Upload new image if provided
        if (imageFile && imageFile.size > 0) {
            const image = await uploadOnCloudinary(imageFile);
            if (image) {
                user.image = image;
            }
        }

        await user.save();

        // Return updated user data
        const updatedUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
        };

        return NextResponse.json(
            {
                message: "Profile updated successfully",
                user: updatedUser,
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            {
                message: "Failed to update profile",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}