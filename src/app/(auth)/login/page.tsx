import LoginForm from './components/loginForm'
import BookHero from './components/bookHero'

function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/30">
            {/* LEFT — LOGIN FORM */}
            <LoginForm />
            
            {/* RIGHT — BOOK HERO */}
            <BookHero />
        </div>
    )
}

export default Login