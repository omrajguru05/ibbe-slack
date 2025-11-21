'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { SmilePlus, Trash2 } from 'lucide-react'

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

interface MessageRead {
    user_id: string
    read_at: string
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
    message_reads?: MessageRead[]
}

interface MessageListProps {
    channelId?: string
    currentUser: User
    onAddMessage?: (callback: (msg: Message) => void) => void
}

export default function MessageList({ channelId, currentUser, onReply, onAddMessage }: MessageListProps & { onReply?: (msg: Message) => void }) {
    const [messages, setMessages] = useState<Message[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Expose addMessage function to parent
    useEffect(() => {
        if (onAddMessage) {
            onAddMessage((msg: Message) => {
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.some(m => m.id === msg.id)) return prev
                    return [...prev, msg]
                })
            })
        }
    }, [onAddMessage])

    useEffect(() => {
        console.log('MessageList mounted, channelId:', channelId)
        if (!channelId) return

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*, profiles(username, avatar_url), reactions(*), parent:messages(id, content, profiles(username)), message_reads(user_id, read_at)')
                .eq('channel_id', channelId)
                .order('created_at', { ascending: true })

            if (error) {
                console.error('Error fetching messages:', error)
            }

            if (data) {
                setMessages(data as any)
                // Mark unread messages as read
                const unreadMessages = data.filter((m: any) =>
                    m.user_id !== currentUser.id &&
                    !m.message_reads?.some((r: any) => r.user_id === currentUser.id)
                )

                if (unreadMessages.length > 0) {
                    const readsToInsert = unreadMessages.map((m: any) => ({
                        message_id: m.id,
                        user_id: currentUser.id
                    }))
                    await supabase.from('message_reads').upsert(readsToInsert, { onConflict: 'message_id,user_id', ignoreDuplicates: true })
                }
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

                    let parentMessage = null
                    if (payload.new.parent_id) {
                        const { data: parent } = await supabase
                            .from('messages')
                            .select('id, content, profiles(username)')
                            .eq('id', payload.new.parent_id)
                            .single()
                        parentMessage = parent
                    }

                    const newMessage = {
                        ...payload.new,
                        profiles: profile,
                        reactions: [],
                        parent: parentMessage,
                        message_reads: []
                    }

                    setMessages((prev) => [...prev, newMessage as any])

                    // Play sound if not sent by current user
                    if (payload.new.user_id !== currentUser.id) {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3')
                        audio.volume = 0.5
                        audio.play().catch(e => console.log('Audio play failed', e))

                        // Update document title
                        document.title = `(1) IBBE_SLACK`

                        // Mark as read immediately if we are viewing the channel
                        if (document.hasFocus()) {
                            await supabase.from('message_reads').upsert({
                                message_id: payload.new.id,
                                user_id: currentUser.id
                            }, { onConflict: 'message_id,user_id', ignoreDuplicates: true })
                        }
                    }

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
                    event: 'DELETE',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    setMessages((prev) => prev.filter(m => m.id !== payload.old.id))
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
                        .select('*, profiles(username, avatar_url), reactions(*), parent:messages!parent_id(id, content, profiles(username)), message_reads(user_id, read_at)')
                        .eq('channel_id', channelId)
                        .order('created_at', { ascending: true })

                    if (data) {
                        setMessages(data as any)
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'message_reads',
                },
                async (payload) => {
                    // Update read status locally
                    setMessages(prev => prev.map(msg => {
                        if (msg.id === payload.new.message_id) {
                            return {
                                ...msg,
                                message_reads: [...(msg.message_reads || []), { user_id: payload.new.user_id, read_at: payload.new.read_at }]
                            }
                        }
                        return msg
                    }))
                }
            )
            .subscribe()

        // Reset title on focus
        const handleFocus = () => {
            document.title = 'IBBE_SLACK'
        }
        window.addEventListener('focus', handleFocus)

        return () => {
            supabase.removeChannel(channel)
            window.removeEventListener('focus', handleFocus)
        }
    }, [channelId, supabase, currentUser.id])

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

    const handleDelete = async (messageId: string) => {
        if (confirm('Delete this message?')) {
            await supabase.from('messages').delete().eq('id', messageId)
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
                const isRead = msg.message_reads && msg.message_reads.length > 0

                return (
                    <div key={msg.id} className={`msg-row flex items-end gap-3 relative group ${isMe ? 'flex-row-reverse' : ''} ${isNew ? 'new-msg' : ''}`}>

                        <div className="w-9 h-9 rounded-full border-2 border-charcoal overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                            {msg.profiles?.avatar_url ? (
                                <img
                                    src={msg.profiles.avatar_url}
                                    alt={msg.profiles.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-sm font-bold text-charcoal">
                                    {msg.profiles?.username?.[0]?.toUpperCase() || '?'}
                                </span>
                            )}
                        </div>

                        <div className={`bubble-group flex flex-col gap-1 max-w-[65%] relative ${isMe ? 'items-end' : ''}`}>

                            {/* Reply Context */}
                            {(msg as any).parent?.id && (
                                <div className={`text-xs text-gray mb-1 flex items-center gap-1 ${isMe ? 'flex-row-reverse' : ''} opacity-70`}>
                                    <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
                                    <span>Replying to <b>{(msg as any).parent.profiles?.username}</b>: "{(msg as any).parent.content?.substring(0, 20)}..."</span>
                                </div>
                            )}

                            <div
                                className={`bubble p-3.5 px-4.5 rounded-[20px] border-2 border-charcoal text-[15px] leading-relaxed relative transition-transform hover:-translate-y-0.5 shadow-[4px_4px_0px_rgba(0,0,0,0.05)] hover:shadow-[6px_6px_0px_rgba(0,0,0,0.1)] ${isMe
                                    ? 'bg-charcoal text-bone rounded-br-md'
                                    : 'bg-bone rounded-bl-md'
                                    }`}
                            >
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="mb-2 flex flex-col gap-2">
                                        {msg.attachments.map((att, i) => (
                                            <div key={i}>
                                                {att.type === 'image' ? (
                                                    <img src={att.url} alt="attachment" className="max-w-full rounded-lg border border-charcoal/20" />
                                                ) : (
                                                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{att.name}</a>
                                                )}
                                                {(att as any).caption && (
                                                    <div className={`text-[13px] mt-1 italic ${isMe ? 'text-bone/80' : 'text-charcoal/80'}`}>
                                                        {(att as any).caption}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {msg.content && <span>{msg.content}</span>}

                                {/* Action Buttons (Hover) */}
                                <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-24' : '-right-24'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                                    {/* Reply Button */}
                                    <button
                                        onClick={() => onReply?.(msg)}
                                        className="p-1.5 rounded-full bg-cream border border-charcoal hover:bg-bone transition-colors"
                                        title="Reply"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                                    </button>

                                    {/* Reaction Button */}
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

                                    {/* Delete Button (only for own messages) */}
                                    {isMe && (
                                        <button
                                            onClick={() => handleDelete(msg.id)}
                                            className="p-1.5 rounded-full bg-red-100 border border-red-400 hover:bg-red-200 transition-colors"
                                            title="Delete message"
                                        >
                                            <Trash2 size={16} className="text-red-600" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Read Receipt Indicator */}
                            {isMe && isRead && (
                                <div className="absolute -bottom-4 right-0 text-[10px] text-blue-500 font-bold flex items-center gap-0.5" title="Read by others">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="-ml-2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                            )}

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
