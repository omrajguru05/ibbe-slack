'use client'

import { useState, useCallback } from 'react'
import MessageList, { type Message } from '@/components/MessageList'
import MessageInput from '@/components/MessageInput'
import { User } from '@supabase/supabase-js'

interface ChatAreaProps {
    channelId: string
    currentUser: User
}

export default function ChatArea({ channelId, currentUser }: ChatAreaProps) {
    const [replyTo, setReplyTo] = useState<any>(null)
    const [addMessageFn, setAddMessageFn] = useState<((message: Message) => void) | null>(null)

    const onAddMessage = useCallback((fn: (message: Message) => void) => {
        setAddMessageFn(() => fn)
    }, [])

    const onMessageSent = useCallback((message: Message) => {
        if (addMessageFn) {
            addMessageFn(message)
        }
    }, [addMessageFn])

    return (
        <>
            <MessageList
                channelId={channelId}
                currentUser={currentUser}
                onReply={(msg) => setReplyTo(msg)}
                onAddMessage={onAddMessage}
            />
            <MessageInput
                channelId={channelId}
                userId={currentUser.id}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
                onMessageSent={onMessageSent}
            />
        </>
    )
}
