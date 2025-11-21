import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function ChatPage() {
    // Redirect to general channel by default
    redirect('/chat/general')
}
