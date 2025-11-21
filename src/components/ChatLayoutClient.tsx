'use client'

import Sidebar from '@/components/Sidebar'
import { SidebarProvider } from '@/context/SidebarContext'

export default function ChatLayoutClient({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <div className="h-screen w-full bg-cream flex items-center justify-center p-6 overflow-hidden">
                <div className="flex w-full max-w-[1200px] h-full bg-bone border-2 border-charcoal rounded-[32px] overflow-hidden shadow-[12px_12px_0px_rgba(29,29,31,0.05)] relative">
                    <Sidebar />
                    <main className="flex-1 flex flex-col bg-bone relative w-full">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
