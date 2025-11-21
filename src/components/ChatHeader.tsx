import Link from 'next/link'
import { Settings } from 'lucide-react'

interface ChatHeaderProps {
    channelName: string
    channelSlug: string
}

export default function ChatHeader({ channelName, channelSlug }: ChatHeaderProps) {
    return (
        <div className="h-20 border-b-2 border-charcoal bg-bone flex items-center justify-between px-8 flex-shrink-0">
            <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-charcoal">#</span>
                <div>
                    <h2 className="font-display text-xl font-bold text-charcoal">{channelName}</h2>
                    <p className="text-xs font-mono text-gray uppercase">3 members • online</p>
                </div>
            </div>
            <Link href="/profile">
                <div className="w-11 h-11 rounded-full border-2 border-charcoal bg-bone flex items-center justify-center cursor-pointer hover:bg-cream transition-colors">
                    <Settings size={20} className="text-charcoal" />
                </div>
            </Link>
        </div>
    )
}
