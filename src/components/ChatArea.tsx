'use client'

import { useState, useCallback } from 'react'
import MessageList from '@/components/MessageList'
import MessageInput from '@/components/MessageInput'
import { User } from '@supabase/supabase-js'

interface MessageRead {
    id: string
    content: string
    user_id: string
    channel_id: string
    created_at: string
    updated_at: string
    file_url?: string | null
    file_type?: string | null
    parent_message_id?: string | null
    profiles?: {
        id: string
        username: string
        full_name: string
        avatar_url: string
    }
    reactions?: any[]
    message_reads?: any[]
}

interface ChatAreaProps {
    channelId: string
    currentUser: User
}

export default function ChatArea({ channelId, currentUser }: ChatAreaProps) {
    const [replyTo, setReplyTo] = useState<any>(null)
    const [addMessageFn, setAddMessageFn] = useState<((message: MessageRead) => void) | null>(null)

    const onAddMessage = useCallback((fn: (message: MessageRead) => void) => {
        setAddMessageFn(() => fn)
    }, [])

    const onMessageSent = useCallback((message: MessageRead) => {
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
