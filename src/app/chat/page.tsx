import { redirect } from 'next/navigation'

export default function ChatPage() {
    // Redirect to general channel by default
    redirect('/chat/general')
}
