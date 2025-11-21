'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { Upload, ArrowRight, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [bio, setBio] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Lazy initialization of Supabase client to fix Vercel prerendering
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single()

            if (profile?.username) {
                router.push('/chat/general')
            }
        }

        checkUser()
    }, [router, supabase])

    useEffect(() => {
        if (cardRef.current) {
            gsap.from(cardRef.current, {
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out"
            })
        }
    }, [step])

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            if (!event.target.files || event.target.files.length === 0) {
                return
            }

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert('hold up, you need to log in first')
                return
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${fileExt}`
            const filePath = fileName

            const { error: uploadError, data } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                alert(`upload failed: ${uploadError.message}`)
                return
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setAvatarUrl(publicUrl)
        } catch (error: any) {
            console.error('Error:', error)
            alert(`error: ${error.message || 'something broke'}`)
        } finally {
            setUploading(false)
        }
    }

    const handleComplete = async () => {
        if (!name || !username) {
            alert('missing required fields (name and username)')
            return
        }

        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('profiles')
                .update({
                    username,
                    avatar_url: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
                    bio: bio || '',
                    status: 'online',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)

            if (error) throw error

            router.push('/chat/general')
        } catch (error) {
            alert('something went wrong during setup')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F7F2E9] flex items-center justify-center p-4">
            <div ref={cardRef} className="w-full max-w-lg bg-[#FFF9F0] border-2 border-[#1D1D1F] rounded-xl p-8 shadow-[8px_8px_0px_#1D1D1F]">

                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 flex items-center justify-center">
                        <img src="/logo.png" alt="IBBE" className="w-full h-full object-contain" />
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-[#1D1D1F]' : 'w-2 bg-[#8E8E93]/30'
                                }`}
                        />
                    ))}
                </div>

                {/* Step 1: Avatar */}
                {step === 1 && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-center">
                            <h1 className="font-sans text-[32px] font-extrabold text-[#1D1D1F] leading-[1.1] mb-2" style={{ letterSpacing: '-0.5px' }}>
                                so you made it this far.
                            </h1>
                            <p className="text-[15px] text-[#1D1D1F]/60 font-normal leading-[1.5]">
                                time to prove you're real
                            </p>
                        </div>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-32 h-32 rounded-full border-2 border-[#1D1D1F] overflow-hidden relative group cursor-pointer bg-[#FFF9F0] hover:shadow-[8px_8px_0px_#1D1D1F] transition-all"
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#8E8E93]/10 flex items-center justify-center">
                                    <Upload size={48} className="text-[#1D1D1F]/60" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-[#1D1D1F]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[#FFF9F0] text-[13px] font-semibold lowercase">
                                    {uploading ? 'uploading...' : avatarUrl ? 'change' : 'upload'}
                                </span>
                            </div>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={uploadAvatar}
                            disabled={uploading}
                        />

                        <div className="w-full flex flex-col gap-2">
                            <button
                                onClick={() => setStep(2)}
                                className="w-full bg-[#1D1D1F] text-[#FFF9F0] font-semibold text-[16px] py-3 rounded-lg border-2 border-[#1D1D1F] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1D1D1F] transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                next <ArrowRight size={20} />
                            </button>
                            <p className="text-[13px] text-[#1D1D1F]/60 text-center font-semibold lowercase">
                                skip if you're boring
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 2: Name & Username */}
                {step === 2 && (
                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="font-sans text-[32px] font-extrabold text-[#1D1D1F] leading-[1.1] mb-2" style={{ letterSpacing: '-0.5px' }}>
                                who are you really?
                            </h1>
                            <p className="text-[15px] text-[#1D1D1F]/60 font-normal leading-[1.5]">
                                pick a username before someone steals it
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-semibold text-[#1D1D1F] lowercase">name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-[#FFF9F0] border-2 border-[#1D1D1F] rounded-lg p-3 font-normal text-[16px] text-[#1D1D1F] outline-none focus:shadow-[4px_4px_0px_#1D1D1F] transition-shadow placeholder:text-[#1D1D1F]/60"
                                    placeholder="your actual name"
                                />
                            </div>

                            <div className="flex flex-col gap-8">
                                <label className="text-[13px] font-semibold text-[#1D1D1F] lowercase">username *</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    className="bg-[#FFF9F0] border-2 border-[#1D1D1F] rounded-lg p-3 font-mono text-[16px] text-[#1D1D1F] outline-none focus:shadow-[4px_4px_0px_#1D1D1F] transition-shadow placeholder:text-[#1D1D1F]/60"
                                    placeholder="username_123"
                                />
                            </div>
                        </div>

                        <div className="flex gap-12">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 bg-[#FFF9F0] text-[#1D1D1F] font-semibold text-[16px] py-3 rounded-lg border-2 border-[#1D1D1F] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1D1D1F] transition-all flex items-center justify-center gap-8 cursor-pointer"
                            >
                                <ArrowLeft size={20} /> back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!name || !username}
                                className="flex-1 bg-[#1D1D1F] text-[#FFF9F0] font-semibold text-[16px] py-3 rounded-lg border-2 border-[#1D1D1F] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1D1D1F] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                            >
                                next <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Bio */}
                {step === 3 && (
                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="font-sans text-[32px] font-extrabold text-[#1D1D1F] leading-[1.1] mb-2" style={{ letterSpacing: '-0.5px' }}>
                                sell yourself (optional)
                            </h1>
                            <p className="text-[15px] text-[#1D1D1F]/60 font-normal leading-[1.5]">
                                or just leave it blank, we get it
                            </p>
                        </div>

                        <div className="flex flex-col gap-8">
                            <label className="text-[13px] font-semibold text-[#1D1D1F] lowercase">bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={5}
                                maxLength={200}
                                className="bg-[#FFF9F0] border-2 border-[#1D1D1F] rounded-lg p-3 font-normal text-[16px] text-[#1D1D1F] outline-none focus:shadow-[4px_4px_0px_#1D1D1F] transition-shadow resize-none placeholder:text-[#1D1D1F]/60"
                                placeholder="what makes you interesting?"
                            />
                            <span className="text-[11px] text-[#1D1D1F]/60 font-semibold">{bio.length}/200</span>
                        </div>

                        <div className="flex gap-12">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 bg-[#FFF9F0] text-[#1D1D1F] font-semibold text-[16px] py-3 rounded-lg border-2 border-[#1D1D1F] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1D1D1F] transition-all flex items-center justify-center gap-8 cursor-pointer"
                            >
                                <ArrowLeft size={20} /> back
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={loading}
                                className="flex-1 bg-[#1D1D1F] text-[#FFF9F0] font-semibold text-[16px] py-3 rounded-lg border-2 border-[#1D1D1F] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1D1D1F] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-[#FFF9F0] border-t-transparent rounded-full animate-spin"></div>
                                        <span>setting up...</span>
                                    </div>
                                ) : (
                                    "let's go"
                                )}
                            </button>
                        </div>
                        <p className="text-[13px] text-[#1D1D1F]/60 text-center font-semibold lowercase">
                            seriously, this is optional
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
