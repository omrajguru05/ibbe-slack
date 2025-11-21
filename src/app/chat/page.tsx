import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ChatHeader from '@/components/ChatHeader'
import MessageList from '@/components/MessageList'
import MessageInput from '@/components/MessageInput'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: channel } = await supabase
        .from('channels')
        .select('*')
        .eq('slug', 'general-chaos')
        .single()

    return (
        <>
            <ChatHeader />
            <MessageList channelId={channel?.id} currentUser={user} />
            <MessageInput channelId={channel?.id} userId={user.id} />
        </>
    )
}
