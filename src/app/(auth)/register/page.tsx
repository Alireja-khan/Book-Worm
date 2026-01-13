    'use client'
    import axios from 'axios';
    import { signIn } from 'next-auth/react';
    import Link from 'next/link';
    import { useRouter } from 'next/navigation';
    import React, { useState } from 'react';
    import { FcGoogle } from "react-icons/fc";
    import { FiAlertCircle } from "react-icons/fi";
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Button } from '@/components/ui/button';
    import Image from 'next/image';

    function Register() {
        const [name, setName] = useState("")
        const [email, setEmail] = useState("")
        const [password, setPassword] = useState("")
        const [confirmPassword, setConfirmPassword] = useState("")
        const [showPassword, setShowPassword] = useState(false)
        const [showConfirmPassword, setShowConfirmPassword] = useState(false)
        const [isLoading, setIsLoading] = useState(false)
        const [error, setError] = useState("")
        const router = useRouter()

        const handleRegister = async (e: React.FormEvent) => {
            e.preventDefault()
            setError("")
            setIsLoading(true)

            // Password validation
            if (password !== confirmPassword) {
                setError("Passwords do not match")
                setIsLoading(false)
                return
            }

            if (password.length < 6) {
                setError("Password must be at least 6 characters long")
                setIsLoading(false)
                return
            }

            try {
                const result = await axios.post('/api/auth/register', {
                    name, email, password
                })
                router.push("/login")
            } catch (error: any) {
                console.log(error)
                if (error.response?.data?.error) {
                    setError(error.response.data.error)
                } else if (error.response?.status === 409) {
                    setError("An account with this email already exists")
                } else {
                    setError("Failed to create account. Please try again.")
                }
            } finally {
                setIsLoading(false)
            }
        }

        const handleGoogleSignIn = async () => {
            setIsLoading(true)
            try {
                await signIn('google', {
                    callbackUrl: "/"
                })
            } catch (error) {
                setError("Failed to sign in with Google")
                setIsLoading(false)
            }
        }

        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/30">

                {/* LEFT -- REGISTER FORM */}
                <div className="w-full max-w-md">
                    {/* Logo/Brand Area */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
                        <p className="text-muted-foreground mt-2">Sign up to get started with our platform</p>
                    </div>

                    {/* Main Card */}
                    <div className="backdrop-blur-sm bg-card/50 border border-border rounded-2xl p-8 shadow-xl shadow-primary/5">
                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                                <FiAlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleRegister}>
                            {/* Name Input */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full pl-11"
                                        onChange={(e) => setName(e.target.value)}
                                        value={name}
                                        required
                                        disabled={isLoading}
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="w-full pl-11"
                                        onChange={(e) => setEmail(e.target.value)}
                                        value={email}
                                        required
                                        disabled={isLoading}
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a strong password"
                                        className="w-full pl-11 pr-12"
                                        onChange={(e) => setPassword(e.target.value)}
                                        value={password}
                                        required
                                        disabled={isLoading}
                                        minLength={6}
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock">
                                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off">
                                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                                                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                                                <line x1="2" x2="22" y1="2" y2="22"></line>
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Password must be at least 6 characters long
                                </p>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        className="w-full pl-11 pr-12"
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        value={confirmPassword}
                                        required
                                        disabled={isLoading}
                                        minLength={6}
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock">
                                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off">
                                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                                                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                                                <line x1="2" x2="22" y1="2" y2="22"></line>
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Terms & Conditions and Submit */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="terms"
                                        disabled={isLoading}
                                        required
                                    />
                                    <Label
                                        htmlFor="terms"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        I agree to the{" "}
                                        <button type="button" className="text-primary hover:text-primary/80 transition-colors">
                                            Terms
                                        </button>{" "}
                                        and{" "}
                                        <button type="button" className="text-primary hover:text-primary/80 transition-colors">
                                            Privacy Policy
                                        </button>
                                    </Label>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-3"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                            Creating account...
                                        </span>
                                    ) : (
                                        "Sign up"
                                    )}
                                </Button>
                            </div>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-4 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        {/* Google Sign In */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3.5"
                        >
                            <FcGoogle className="w-5 h-5" />
                            <span>Sign up with Google</span>
                        </Button>

                        {/* Login Link */}
                        <div className="mt-8 pt-6 border-t border-border text-center">
                            <p className="text-muted-foreground">
                                Already have an account?{" "}
                                <Link
                                    href='/login'
                                    className="text-primary font-medium hover:text-primary/80 transition"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-muted-foreground">
                            By creating an account, you agree to our{" "}
                            <button className="hover:text-foreground transition-colors">Terms of Service</button> and{" "}
                            <button className="hover:text-foreground transition-colors">Privacy Policy</button>
                        </p>
                    </div>
                </div>

                {/* RIGHT — BOOK HERO */}
                <div className="relative mt-10 hidden lg:flex items-center justify-center">

                    {/* Ground shadow */}
                    <div className="hero-ground-shadow absolute bottom-32 h-16 w-80 blur-2xl opacity-90" />

                    {/* Book */}
                    <Image
                        src="/alchemist.png"
                        alt="The Alchemist Book"
                        width={560}
                        height={520}
                        priority
                        className="relative drop-shadow-[0_32px_48px_oklch(0.15_0.02_95_/_0.35)]" />
                </div>
            </div>
        )
    }

    export default Register