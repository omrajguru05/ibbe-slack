'use client'

import { LogOut, Plus, Hash, Volume2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Sidebar() {
    const supabase = createClient()
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="w-[280px] border-r-2 border-charcoal bg-cream flex-col hidden md:flex">
            {/* Header */}
            <div className="h-20 border-b-2 border-charcoal flex items-center px-6 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-charcoal mr-2"></div>
                <h1 className="font-display text-xl font-bold tracking-tight">IBBE_SLACK</h1>
            </div>

            {/* Channels */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <span className="font-mono text-xs font-bold text-gray">CHANNELS</span>
                        <Plus size={16} className="cursor-pointer hover:text-charcoal text-gray transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1">
                        {['general-chaos', 'memes-only', 'dev-talk', 'music-recs'].map((channel, i) => (
                            <div key={channel} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-bone border-2 border-transparent hover:border-charcoal ${i === 0 ? 'bg-bone border-charcoal shadow-[4px_4px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' : ''}`}>
                                <Hash size={16} className="text-gray" />
                                <span className="font-bold text-sm">{channel}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Voice Channels (Mock) */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <span className="font-mono text-xs font-bold text-gray">VOICE</span>
                        <Plus size={16} className="cursor-pointer hover:text-charcoal text-gray transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-bone transition-colors opacity-50">
                            <Volume2 size={16} className="text-gray" />
                            <span className="font-bold text-sm">Lounge</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Footer */}
            <div className="p-4 border-t-2 border-charcoal bg-bone">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream cursor-pointer transition-colors group" onClick={handleLogout}>
                    <div className="w-8 h-8 rounded-full bg-charcoal overflow-hidden relative">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                        <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center">
                            <LogOut size={12} className="text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">You</div>
                        <div className="text-[10px] font-mono text-gray">Online</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
