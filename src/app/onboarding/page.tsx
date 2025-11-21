'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { Upload, ArrowRight, ArrowLeft } from 'lucide-react'

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [bio, setBio] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()
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
                router.push('/chat')
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
                alert('Please log in first')
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
                alert(`Upload failed: ${uploadError.message}`)
                return
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setAvatarUrl(publicUrl)
        } catch (error: any) {
            console.error('Error:', error)
            alert(`Error: ${error.message || 'Unknown error'}`)
        } finally {
            setUploading(false)
        }
    }

    const handleComplete = async () => {
        if (!name || !username) {
            alert('Please fill in all required fields')
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

            router.push('/chat')
        } catch (error) {
            alert('Error completing onboarding!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-bone flex items-center justify-center p-4">
            <div ref={cardRef} className="w-full max-w-lg bg-cream border-2 border-charcoal rounded-xl p-8 shadow-[8px_8px_0px_#1d1d1f]">

                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-charcoal' : 'w-2 bg-gray/30'
                                }`}
                        />
                    ))}
                </div>

                {step === 1 && (
                    <div className="flex flex-col items-center gap-6">
                        <h1 className="font-display text-3xl font-bold text-charcoal">Welcome aboard!</h1>
                        <p className="text-center text-gray font-mono">Let's set up your profile</p>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-32 h-32 rounded-full border-4 border-charcoal overflow-hidden relative group cursor-pointer bg-bone hover:shadow-[8px_8px_0px_rgba(0,0,0,0.2)] transition-all"
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray/10 flex items-center justify-center">
                                    <Upload size={32} className="text-gray" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold">
                                    {uploading ? 'UPLOADING...' : avatarUrl ? 'CHANGE' : 'UPLOAD'}
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

                        <button
                            onClick={() => setStep(2)}
                            className="mt-4 w-full bg-charcoal text-bone font-mono font-bold py-3 rounded-lg border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2"
                        >
                            Next <ArrowRight size={20} />
                        </button>
                        <p className="text-xs text-gray text-center">You can skip this and add later</p>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="font-display text-3xl font-bold text-charcoal mb-2">Tell us about yourself</h1>
                            <p className="text-gray font-mono text-sm">Choose a unique username</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-mono text-sm font-bold text-charcoal uppercase">Name *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-bone border-2 border-charcoal rounded-lg p-3 font-sans text-charcoal outline-none focus:shadow-[4px_4px_0px_rgba(29,29,31,0.1)] transition-shadow"
                                placeholder="Your full name"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-mono text-sm font-bold text-charcoal uppercase">Username *</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                className="bg-bone border-2 border-charcoal rounded-lg p-3 font-mono text-charcoal outline-none focus:shadow-[4px_4px_0px_rgba(29,29,31,0.1)] transition-shadow"
                                placeholder="username_123"
                            />
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 bg-bone text-charcoal font-mono font-bold py-3 rounded-lg border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={20} /> Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!name || !username}
                                className="flex-1 bg-charcoal text-bone font-mono font-bold py-3 rounded-lg border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Next <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="font-display text-3xl font-bold text-charcoal mb-2">Add a bio</h1>
                            <p className="text-gray font-mono text-sm">Tell others about yourself</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-mono text-sm font-bold text-charcoal uppercase">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                maxLength={200}
                                className="bg-bone border-2 border-charcoal rounded-lg p-3 font-sans text-charcoal outline-none focus:shadow-[4px_4px_0px_rgba(29,29,31,0.1)] transition-shadow resize-none"
                                placeholder="I love coding and chatting..."
                            />
                            <span className="text-xs text-gray font-mono">{bio.length}/200 characters</span>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 bg-bone text-charcoal font-mono font-bold py-3 rounded-lg border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={20} /> Back
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={loading}
                                className="flex-1 bg-charcoal text-bone font-mono font-bold py-3 rounded-lg border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Complete Setup'}
                            </button>
                        </div>
                        <p className="text-xs text-gray text-center">You can skip and add this later</p>
                    </div>
                )}
            </div>
        </div>
    )
}
