'use client'

import { useEffect, useRef, useState, ChangeEvent } from 'react'
import { gsap } from 'gsap'
import { createClient } from '@/utils/supabase/client'

interface MessageInputProps {
    channelId?: string
    userId: string
}

export default function MessageInput({ channelId, userId }: MessageInputProps) {
    const [message, setMessage] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const typingIndicatorRef = useRef<HTMLDivElement>(null)
    const typingTextRef = useRef<HTMLSpanElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    useEffect(() => {
        const stories = [
            "anzilah is typing...",
            "wait, she's deleting it...",
            "anzilah is typing a novel...",
            "she's probably correcting your grammar...",
            "anzilah paused to judge you...",
            "okay, she's actually typing now..."
        ]
        let storyIndex = 0

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 })

        // Initial fade in
        gsap.to(typingIndicatorRef.current, { opacity: 1, duration: 0.3 })

        const interval = setInterval(() => {
            storyIndex = (storyIndex + 1) % stories.length

            gsap.to(typingTextRef.current, {
                y: -10,
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    if (typingTextRef.current) {
                        typingTextRef.current.innerText = stories[storyIndex]
                        gsap.fromTo(typingTextRef.current,
                            { y: 10, opacity: 0 },
                            { y: 0, opacity: 1, duration: 0.3 }
                        )
                    }
                }
            })
        }, 2500)

        return () => clearInterval(interval)
    }, [])

    const handleSend = async () => {
        if (!message.trim() || !channelId) return

        const content = message
        setMessage('')

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
            content: '', // Empty content for file-only message, or could be filename
            channel_id: channelId,
            user_id: userId,
            attachments: [{ type: 'image', url: publicUrl, name: file.name }]
        })

        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
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
                <span ref={typingTextRef}>anzilah is typing...</span>
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
                    onChange={(e) => setMessage(e.target.value)}
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
