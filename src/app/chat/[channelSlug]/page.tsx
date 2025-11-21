import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MessageList from '@/components/MessageList'
import MessageInput from '@/components/MessageInput'
import ChatHeader from '@/components/ChatHeader'

export default async function ChannelPage({ params }: { params: { channelSlug: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { channelSlug } = params

    // Fetch channel by slug
    const { data: channel, error } = await supabase
        .from('channels')
        .select('*')
        .eq('slug', channelSlug)
        .single()

    if (error || !channel) {
        // Channel doesn't exist
        if (channelSlug === 'general') {
            return (
                <div className="flex-1 flex items-center justify-center text-charcoal font-mono">
                    Error: General channel not found. Please contact support.
                </div>
            )
        }
        redirect('/chat/general')
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <ChatHeader channelName={channel.name} channelSlug={channel.slug} />
            <MessageList channelId={channel.id} currentUser={user} />
            <MessageInput channelId={channel.id} userId={user.id} />
        </div>
    )
}
