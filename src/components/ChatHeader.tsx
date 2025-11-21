'use client'

import { Settings, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'

interface ChatHeaderProps {
    channelName: string
    channelSlug: string
}

export default function ChatHeader({ channelName, channelSlug }: ChatHeaderProps) {
    const router = useRouter()
    const { toggle } = useSidebar()

    return (
        <div className="h-20 border-b-2 border-charcoal flex items-center justify-between px-6 bg-bone flex-shrink-0">
            <div className="flex items-center gap-3">
                <button
                    onClick={toggle}
                    className="md:hidden p-2 -ml-2 hover:bg-cream rounded-lg transition-colors"
                >
                    <Menu size={20} />
                </button>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl font-bold"># {channelName}</h2>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray uppercase tracking-wider">
                        <span>3 Members</span>
                        <span>•</span>
                        <span>Online</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => router.push('/profile')}
                className="w-10 h-10 rounded-full border-2 border-charcoal flex items-center justify-center hover:bg-cream transition-colors"
            >
                <Settings size={20} />
            </button>
        </div>
    )
}
