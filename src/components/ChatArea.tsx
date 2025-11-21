'use client'

import { useState } from 'react'
import MessageList from '@/components/MessageList'
import MessageInput from '@/components/MessageInput'
import { User } from '@supabase/supabase-js'

interface ChatAreaProps {
    channelId: string
    currentUser: User
}

export default function ChatArea({ channelId, currentUser }: ChatAreaProps) {
    const [replyTo, setReplyTo] = useState<any>(null)

    return (
        <>
            <MessageList
                channelId={channelId}
                currentUser={currentUser}
                onReply={(msg) => setReplyTo(msg)}
            />
            <MessageInput
                channelId={channelId}
                userId={currentUser.id}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
            />
        </>
    )
}
