'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [userId, setUserId] = useState('')
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            setUserId(user.id)

            const { data, error } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', user.id)
                .single()

            if (data) {
                setUsername(data.username || '')
                setAvatarUrl(data.avatar_url || '')
            }

            setLoading(false)
        }

        getProfile()
    }, [router, supabase])

    useEffect(() => {
        if (!loading) {
            gsap.from(".profile-card", {
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out"
            })
        }
    }, [loading])

    const updateProfile = async () => {
        try {
            setLoading(true)
            const { error } = await supabase
                .from('profiles')
                .update({
                    username,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId)

            if (error) throw error
            alert('Profile updated!')
        } catch (error) {
            alert('Error updating the data!')
        } finally {
            setLoading(false)
        }
    }

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setAvatarUrl(publicUrl)
        } catch (error) {
            alert('Error uploading avatar!')
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen bg-bone flex items-center justify-center font-mono text-charcoal">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-bone flex items-center justify-center p-4">
            <div className="profile-card w-full max-w-md bg-cream border-2 border-charcoal rounded-xl p-8 shadow-[8px_8px_0px_#1d1d1f]">
                <h1 className="font-display text-3xl font-bold text-charcoal mb-8">Profile Settings</h1>

                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-full border-2 border-charcoal overflow-hidden relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray/20 flex items-center justify-center text-gray">
                                    <span>No Img</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold">CHANGE</span>
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
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-mono text-sm font-bold text-charcoal uppercase">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-bone border-2 border-charcoal rounded-lg p-3 font-sans text-charcoal outline-none focus:shadow-[4px_4px_0px_rgba(29,29,31,0.1)] transition-shadow"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-mono text-sm font-bold text-charcoal uppercase">Email</label>
                        <input
                            type="text"
                            value={userId} // Just showing ID for now as email isn't in profile table yet, or fetch from auth
                            disabled
                            className="bg-gray/10 border-2 border-charcoal/50 rounded-lg p-3 font-sans text-charcoal/50 outline-none cursor-not-allowed"
                        />
                    </div>

                    <button
                        onClick={updateProfile}
                        disabled={loading}
                        className="mt-4 bg-charcoal text-bone font-mono font-bold py-3 rounded-lg border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all active:translate-y-0 active:shadow-none"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                        onClick={() => router.push('/chat')}
                        className="text-center text-sm font-mono font-bold text-charcoal/70 hover:text-charcoal hover:underline"
                    >
                        Back to Chat
                    </button>
                </div>
            </div>
        </div>
    )
}
