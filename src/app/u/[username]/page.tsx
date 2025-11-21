'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageSquare } from 'lucide-react'

interface Profile {
    id: string
    username: string
    avatar_url: string
    status: 'online' | 'offline' | 'busy'
    bio?: string
    last_seen?: string
}

export default function ProfilePage({ params }: { params: { username: string } }) {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', params.username)
                .single()

            if (data) {
                setProfile(data)
            }
            setLoading(false)
        }

        fetchProfile()
    }, [params.username, supabase])

    if (loading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="animate-pulse text-charcoal font-bold">loading profile...</div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
                <div className="text-2xl font-bold text-charcoal">user not found</div>
                <button
                    onClick={() => router.back()}
                    className="text-sm underline decoration-2"
                >
                    go back
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-bone border-2 border-charcoal rounded-3xl overflow-hidden shadow-[8px_8px_0px_rgba(29,29,31,0.05)] relative">

                {/* Header / Cover */}
                <div className="h-32 bg-charcoal relative">
                    <button
                        onClick={() => router.back()}
                        className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full border-2 border-charcoal flex items-center justify-center hover:scale-105 transition-transform z-10"
                    >
                        <ArrowLeft size={20} />
                    </button>
                </div>

                {/* Profile Content */}
                <div className="px-8 pb-8 relative">
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full border-4 border-bone bg-white absolute -top-16 left-1/2 -translate-x-1/2 overflow-hidden flex items-center justify-center shadow-lg">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-charcoal">{profile.username[0].toUpperCase()}</span>
                        )}
                    </div>

                    <div className="mt-20 text-center">
                        <h1 className="text-3xl font-extrabold text-charcoal mb-2">{profile.username}</h1>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-charcoal/10 mb-6">
                            <div className={`w-2 h-2 rounded-full ${profile.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span className="text-xs font-mono uppercase tracking-widest text-gray">{profile.status}</span>
                        </div>

                        {profile.bio && (
                            <p className="text-charcoal/80 text-sm leading-relaxed mb-8 max-w-[80%] mx-auto">
                                {profile.bio}
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-2xl border-2 border-charcoal/5">
                                <div className="text-xs font-mono text-gray uppercase mb-1">Joined</div>
                                <div className="font-bold text-charcoal">Recently</div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border-2 border-charcoal/5">
                                <div className="text-xs font-mono text-gray uppercase mb-1">Last Seen</div>
                                <div className="font-bold text-charcoal">
                                    {profile.last_seen ? new Date(profile.last_seen).toLocaleDateString() : 'Unknown'}
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-8 bg-charcoal text-bone font-bold py-3 rounded-xl border-2 border-charcoal shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2">
                            <MessageSquare size={18} />
                            <span>Send Message</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
