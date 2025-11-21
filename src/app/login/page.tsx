'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import { login, signup } from './actions'

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
        "stress levels detected: <span class='text-white font-bold border-b border-dashed border-gray-500'>high</span>",
        "analyzing coffee intake...",
        "caffeine content: <span class='text-white font-bold border-b border-dashed border-gray-500'>critical</span>",
        "loading excuses for being late...",
        "verifying if you actually read the terms of service...",
        "spoiler: <span class='text-white font-bold border-b border-dashed border-gray-500'>you didn't</span>"
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
                            className="w-full p-4 bg-charcoal text-bone border-none rounded-xl font-bold text-base cursor-pointer mt-3 flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                        >
                            {loading ? 'processing...' : (isLogin ? 'let me in' : 'sign up')}
                            {!loading && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
                            )}
                        </button>
                    </form>

                    <div className="flex items-center my-8 text-xs text-gray font-semibold">
                        <div className="flex-1 h-[2px] bg-line"></div>
                        <span className="px-3">or if you're feeling lazy</span>
                        <div className="flex-1 h-[2px] bg-line"></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="w-full p-3.5 bg-transparent border-2 border-charcoal rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2.5 transition-colors hover:bg-cream"
                    >
                        {isLogin ? 'need an account? sign up' : 'already have one? sign in'}
                    </button>

                    <div className="mt-auto pt-8 text-center text-[13px] text-gray">
                        forgot password? <a href="#" className="text-charcoal font-bold no-underline border-b-2 border-line hover:border-charcoal">good luck.</a>
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
