'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import { login, signup, signInWithGoogle } from './actions'

gsap.registerPlugin(TextPlugin)

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const containerRef = useRef<HTMLDivElement>(null)
    const logContainerRef = useRef<HTMLDivElement>(null)
    const finalStatusRef = useRef<HTMLDivElement>(null)
    const jokeTextRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // GSAP Animations
        const tl = gsap.timeline({ delay: 0.5 })

        // Stagger logs
        tl.to('.log-line', {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.5,
            ease: "power2.out"
        })

        // Reveal Result Box
        tl.to(finalStatusRef.current, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
        }, "+=0.2")

        // Type the joke
        const jokes = [
            "access granted. try not to break anything today.",
            "password accepted. it was 'password123', wasn't it?",
            "welcome back. we put the bugs in a box for now.",
            "login successful. your imposter syndrome is loading..."
        ]
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)]

        tl.to(jokeTextRef.current, {
            duration: 2,
            text: {
                value: randomJoke,
                delimiter: ""
            },
            ease: "none"
        })
    }, [])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const action = isLogin ? login : signup
        const result = await action(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
        // If success, redirect happens in server action
    }

    const logs = [
        "detecting user presence...",
        "scanning facial geometry for signs of stress...",
        "stress levels detected: <span className='text-white font-bold border-b border-dashed border-gray-500'>high</span>",
        "analyzing coffee intake...",
        "caffeine content: <span className='text-white font-bold border-b border-dashed border-gray-500'>critical</span>",
        "loading excuses for being late...",
        "verifying if you actually read the terms of service...",
        "spoiler: <span className='text-white font-bold border-b border-dashed border-gray-500'>you didn't</span>"
    ]

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-cream text-charcoal font-sans">
            <div className="flex flex-col md:flex-row w-full max-w-[1000px] gap-8 items-stretch">

                {/* LEFT: The Form */}
                <div className="flex-1 bg-bone border-2 border-charcoal rounded-3xl p-12 flex flex-col shadow-[8px_8px_0px_rgba(29,29,31,0.05)] relative overflow-hidden">
                    <div className="mb-8">
                        <div className="w-12 h-12 bg-charcoal text-bone rounded-xl flex items-center justify-center text-2xl mb-6">
                            ✦
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight mb-2 leading-tight">
                            {isLogin ? 'welcome back, human.' : 'join the resistance.'}
                        </h1>
                        <p className="text-[15px] text-gray leading-relaxed">
                            {isLogin ? 'please sign in. the robots miss you.' : 'create an account. resistance is futile.'}
                        </p>
                    </div>

                    <form action={handleSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-[13px] font-semibold mb-2 lowercase tracking-wide">
                                email (the one you actually check)
                            </label>
                            <div className="relative">
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full p-3.5 bg-cream border-2 border-line rounded-xl font-sans text-[15px] text-charcoal outline-none transition-all focus:border-charcoal focus:shadow-[4px_4px_0px_rgba(29,29,31,0.1)] focus:bg-white placeholder:text-[#CCC]"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-semibold mb-2 lowercase tracking-wide">
                                password (hope you wrote it down)
                            </label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full p-3.5 bg-cream border-2 border-line rounded-xl font-sans text-[15px] text-charcoal outline-none transition-all focus:border-charcoal focus:shadow-[4px_4px_0px_rgba(29,29,31,0.1)] focus:bg-white placeholder:text-[#CCC]"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-charcoal text-bone font-bold py-4 rounded-xl border-2 border-charcoal shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <span className="animate-pulse">processing...</span>
                            ) : (
                                <>
                                    <span>{isLogin ? 'enter the void' : 'initiate sequence'}</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-0.5 flex-1 bg-gray-300"></div>
                        <span className="text-xs font-mono text-gray uppercase tracking-widest">or</span>
                        <div className="h-0.5 flex-1 bg-gray-300"></div>
                    </div>

                    <button
                        onClick={async () => {
                            setLoading(true)
                            await signInWithGoogle()
                        }}
                        disabled={loading}
                        className="w-full bg-white text-charcoal font-bold py-3 rounded-xl border-2 border-charcoal shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        continue with google
                    </button>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm font-bold underline decoration-2 decoration-charcoal/30 hover:decoration-charcoal transition-all"
                        >
                            {isLogin ? "don't have an account? join us." : "already have an account? login."}
                        </button>
                    </div>
                </div>

                {/* RIGHT: The Vibe Check (Terminal) */}
                <div className="flex-1 bg-charcoal rounded-3xl border-2 border-charcoal p-12 flex flex-col justify-between text-bone font-mono shadow-[8px_8px_0_rgba(29,29,31,0.1)] min-h-[500px] relative overflow-hidden md:min-h-auto">
                    <div className="flex items-center gap-2 text-xs tracking-widest text-gray mb-6">
                        <div className="w-2.5 h-2.5 bg-green rounded-full animate-pulse"></div>
                        system_status: judging_you
                    </div>

                    <div className="flex-1 flex flex-col gap-3 text-[13px] leading-relaxed text-[#DDD]" ref={logContainerRef}>
                        {logs.map((log, i) => (
                            <div key={i} className="log-line flex gap-2 opacity-0 translate-y-[5px]">
                                <span className="text-green font-bold">&gt;</span>
                                <span dangerouslySetInnerHTML={{ __html: log }} />
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 bg-white/10 border border-white/20 rounded-2xl p-6 opacity-0" ref={finalStatusRef}>
                        <div className="text-[11px] uppercase text-gray tracking-widest mb-3">security analysis</div>
                        <div className="font-sans text-lg font-bold leading-snug" ref={jokeTextRef}></div>
                    </div>
                </div>

            </div>
        </div>
    )
}
