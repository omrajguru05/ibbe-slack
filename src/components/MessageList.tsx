'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { SmilePlus } from 'lucide-react'

interface Attachment {
    type: 'image' | 'file'
    url: string
    name: string
}

interface Reaction {
    id: string
    message_id: string
    user_id: string
    emoji: string
}

interface Message {
    id: string
    user_id: string
    content: string
    created_at: string
    attachments?: Attachment[]
    profiles: {
        username: string
        avatar_url: string
    }
    reactions?: Reaction[]
}

interface MessageListProps {
    channelId?: string
    currentUser: User
}

export default function MessageList({ channelId, currentUser }: MessageListProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        if (!channelId) return

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*, profiles(username, avatar_url), reactions(*)')
                .eq('channel_id', channelId)
                .order('created_at', { ascending: true })

            if (data) {
                setMessages(data as any)
            }
        }

        fetchMessages()

        const channel = supabase
            .channel('realtime-messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `channel_id=eq.${channelId}`,
                },
                async (payload) => {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('username, avatar_url')
                        .eq('id', payload.new.user_id)
                        .single()

                    const newMessage = {
                        ...payload.new,
                        profiles: profile,
                        reactions: []
                    }

                    setMessages((prev) => [...prev, newMessage as any])

                    setTimeout(() => {
                        gsap.from(".new-msg", {
                            y: 20, opacity: 0, duration: 0.4, ease: "back.out(1.7)",
                            onComplete: () => { document.querySelector('.new-msg')?.classList.remove('new-msg'); }
                        });
                    }, 100)
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'reactions',
                },
                async () => {
                    // Refresh messages to get updated reactions
                    const { data } = await supabase
                        .from('messages')
                        .select('*, profiles(username, avatar_url), reactions(*)')
                        .eq('channel_id', channelId)
                        .order('created_at', { ascending: true })

                    if (data) {
                        setMessages(data as any)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [channelId, supabase])

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
    }, [messages.length])

    const handleReaction = async (messageId: string, emoji: string) => {
        const existingReaction = messages.find(m => m.id === messageId)?.reactions?.find(r => r.user_id === currentUser.id && r.emoji === emoji)

        if (existingReaction) {
            await supabase.from('reactions').delete().eq('id', existingReaction.id)
        } else {
            await supabase.from('reactions').insert({
                message_id: messageId,
                user_id: currentUser.id,
                emoji
            })
        }
    }

    const groupReactions = (reactions: Reaction[] = []) => {
        const groups: { [emoji: string]: { count: number, hasReacted: boolean } } = {}
        reactions.forEach(r => {
            if (!groups[r.emoji]) groups[r.emoji] = { count: 0, hasReacted: false }
            groups[r.emoji].count++
            if (r.user_id === currentUser.id) groups[r.emoji].hasReacted = true
        })
        return Object.entries(groups)
    }

    return (
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 scrollbar-hide" ref={containerRef}>
            {messages.map((msg, index) => {
                const isMe = msg.user_id === currentUser.id
                const isNew = index === messages.length - 1

                return (
                    <div key={msg.id} className={`msg-row flex items-end gap-3 relative group ${isMe ? 'flex-row-reverse' : ''} ${isNew ? 'new-msg' : ''}`}>

                        <div className="w-9 h-9 rounded-full border-2 border-charcoal overflow-hidden flex-shrink-0">
                            <img
                                src={msg.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user_id}`}
                                alt={msg.profiles?.username}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className={`bubble-group flex flex-col gap-1 max-w-[65%] relative ${isMe ? 'items-end' : ''}`}>

                            <div
                                className={`bubble p-3.5 px-4.5 rounded-[20px] border-2 border-charcoal text-[15px] leading-relaxed relative transition-transform hover:-translate-y-0.5 shadow-[4px_4px_0px_rgba(0,0,0,0.05)] hover:shadow-[6px_6px_0px_rgba(0,0,0,0.1)] ${isMe
                                    ? 'bg-charcoal text-bone rounded-br-md'
                                    : 'bg-bone rounded-bl-md'
                                    }`}
                            >
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="mb-2">
                                        {msg.attachments.map((att, i) => (
                                            att.type === 'image' ? (
                                                <img key={i} src={att.url} alt="attachment" className="max-w-full rounded-lg border border-charcoal/20" />
                                            ) : (
                                                <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{att.name}</a>
                                            )
                                        ))}
                                    </div>
                                )}
                                {msg.content && <span>{msg.content}</span>}

                                {/* Reaction Button (Hover) */}
                                <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-10' : '-right-10'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    <div className="relative group/picker">
                                        <button className="p-1.5 rounded-full bg-cream border border-charcoal hover:bg-bone transition-colors">
                                            <SmilePlus size={16} className="text-charcoal" />
                                        </button>
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-bone border-2 border-charcoal rounded-xl p-1 flex gap-1 hidden group-hover/picker:flex shadow-lg z-10">
                                            {['❤️', '😂', '😮', '😢', '👍'].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleReaction(msg.id, emoji)}
                                                    className="p-1 hover:bg-cream rounded text-lg transition-transform hover:scale-110"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reactions Display */}
                            {msg.reactions && msg.reactions.length > 0 && (
                                <div className={`flex gap-1 flex-wrap ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {groupReactions(msg.reactions).map(([emoji, { count, hasReacted }]) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleReaction(msg.id, emoji)}
                                            className={`px-1.5 py-0.5 text-xs rounded-full border border-charcoal flex items-center gap-1 transition-colors ${hasReacted ? 'bg-blue-100' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            <span>{emoji}</span>
                                            <span className="font-semibold">{count}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className={`meta text-[11px] text-gray font-semibold mt-1 flex gap-1.5 items-center ${isMe ? 'justify-end' : ''}`}>
                                {msg.profiles?.username || 'User'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
