import Link from 'next/link'

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen bg-bone flex items-center justify-center p-4">
            <div className="bg-cream border-2 border-charcoal rounded-xl p-8 max-w-md w-full shadow-[8px_8px_0px_#1d1d1f] text-center">
                <h1 className="font-display text-3xl font-bold text-charcoal mb-4">Authentication Error</h1>
                <p className="font-mono text-charcoal/70 mb-8">
                    Oops! Something went wrong while trying to sign you in. This might be due to an expired link or a temporary glitch.
                </p>
                <Link
                    href="/login"
                    className="inline-block bg-charcoal text-bone font-mono font-bold py-3 px-6 rounded-lg border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    )
}
