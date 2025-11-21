'use client'

import { useEffect, useRef, useState, ChangeEvent } from 'react'
import { gsap } from 'gsap'
import { createClient } from '@/utils/supabase/client'

interface TypingUser {
    username: string
}

interface MessageInputProps {
    channelId?: string
    userId: string
}

export default function MessageInput({ channelId, userId }: MessageInputProps) {
    const [message, setMessage] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
    const typingIndicatorRef = useRef<HTMLDivElement>(null)
    const typingTextRef = useRef<HTMLSpanElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const supabase = createClient()

    useEffect(() => {
        if (!channelId) return

        // Subscribe to typing indicators
        const channel = supabase
            .channel('typing-indicators')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'typing_indicators',
                    filter: `channel_id=eq.${channelId}`,
                },
                async () => {
                    // Fetch current typing users
                    const { data } = await supabase
                        .from('typing_indicators')
                        .select('user_id, profiles(username)')
                        .eq('channel_id', channelId)
                        .neq('user_id', userId) // Exclude current user

                    if (data) {
                        const users = data.map((item: any) => ({
                            username: item.profiles?.username || 'Someone'
                        }))
                        setTypingUsers(users)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [channelId, userId, supabase])

    useEffect(() => {
        // Animate typing indicator
        if (typingUsers.length > 0 && typingIndicatorRef.current) {
            gsap.to(typingIndicatorRef.current, { opacity: 1, duration: 0.3 })
        } else if (typingIndicatorRef.current) {
            gsap.to(typingIndicatorRef.current, { opacity: 0, duration: 0.3 })
        }
    }, [typingUsers])

    const handleTyping = async (value: string) => {
        setMessage(value)

        if (!channelId || !value.trim()) {
            // Remove typing indicator if message is empty
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
            await supabase
                .from('typing_indicators')
                .delete()
                .eq('channel_id', channelId)
                .eq('user_id', userId)
            return
        }

        // Insert or update typing indicator
        await supabase
            .from('typing_indicators')
            .upsert({
                channel_id: channelId,
                user_id: userId,
                created_at: new Date().toISOString()
            })

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        // Remove typing indicator after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(async () => {
            await supabase
                .from('typing_indicators')
                .delete()
                .eq('channel_id', channelId)
                .eq('user_id', userId)
        }, 3000)
    }

    const handleSend = async () => {
        if (!message.trim() || !channelId) return

        const content = message
        setMessage('')

        // Remove typing indicator
        await supabase
            .from('typing_indicators')
            .delete()
            .eq('channel_id', channelId)
            .eq('user_id', userId)

        // Send message
        await supabase.from('messages').insert({
            content,
            channel_id: channelId,
            user_id: userId
        })
    }

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !channelId) return

        const file = e.target.files[0]
        setIsUploading(true)

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${channelId}/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('chat-attachments')
            .upload(filePath, file)

        if (uploadError) {
            console.error('Error uploading file:', uploadError)
            setIsUploading(false)
            return
        }

        const { data: { publicUrl } } = supabase.storage
            .from('chat-attachments')
            .getPublicUrl(filePath)

        // Send message with attachment
        await supabase.from('messages').insert({
            content: file.name,
            channel_id: channelId,
            user_id: userId,
            attachments: [{ type: 'image', url: publicUrl, name: file.name }]
        })

        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const getTypingText = () => {
        if (typingUsers.length === 0) return ''
        if (typingUsers.length === 1) return `${typingUsers[0].username} is typing...`
        if (typingUsers.length === 2) return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`
        return `${typingUsers.length} people are typing...`
    }

    return (
        <div className="p-6 px-8 bg-bone border-t-2 border-charcoal flex flex-col gap-3">

            {/* Typing Indicator */}
            <div className="text-xs text-gray font-semibold h-5 flex items-center gap-2 opacity-0" ref={typingIndicatorRef}>
                <div className="flex gap-1">
                    <span className="w-1 h-1 bg-gray rounded-full animate-bounce [animation-delay:-0.32s]"></span>
                    <span className="w-1 h-1 bg-gray rounded-full animate-bounce [animation-delay:-0.16s]"></span>
                    <span className="w-1 h-1 bg-gray rounded-full animate-bounce"></span>
                </div>
                <span ref={typingTextRef}>{getTypingText()}</span>
            </div>

            <div className="flex gap-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-[52px] h-[52px] bg-cream border-2 border-charcoal rounded-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 disabled:opacity-50"
                    title="Upload Image"
                >
                    {isUploading ? (
                        <div className="w-5 h-5 border-2 border-charcoal border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    )}
                </button>

                <input
                    type="text"
                    value={message}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-cream border-2 border-charcoal rounded-2xl p-3.5 px-5 font-sans text-[15px] text-charcoal outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(29,29,31,0.1)]"
                    placeholder="type something risky..."
                />
                <button
                    onClick={handleSend}
                    className="w-[52px] h-[52px] bg-charcoal text-bone rounded-2xl border-none flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current translate-x-0.5"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                </button>
            </div>
        </div>
    )
}
