'use client'

import { Settings } from 'lucide-react'
import Link from 'next/link'

interface ChatHeaderProps {
    channelName?: string
    memberCount?: number
}

export default function ChatHeader({ channelName = 'general-chaos', memberCount = 3 }: ChatHeaderProps) {
    return (
        <div className="h-20 border-b-2 border-charcoal bg-bone flex items-center justify-between px-8 flex-shrink-0 z-10">
            <div>
                <h2 className="font-display text-xl font-bold text-charcoal flex items-center gap-2">
                    <span className="text-gray">#</span>
                    {channelName}
                </h2>
                <p className="text-xs font-mono font-bold text-gray mt-1">
                    {memberCount} MEMBERS • ONLINE
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-bone bg-gray overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                        </div>
                    ))}
                </div>
                <Link href="/profile">
                    <button className="w-10 h-10 rounded-full border-2 border-charcoal flex items-center justify-center hover:bg-cream transition-colors">
                        <Settings size={20} className="text-charcoal" />
                    </button>
                </Link>
            </div>
        </div>
    )
}
