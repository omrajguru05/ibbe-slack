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
            <div className="h-dvh w-full bg-cream flex items-center justify-center p-2 md:p-6 overflow-hidden">
                <div className="flex w-full max-w-[1200px] h-full bg-bone border-2 border-charcoal rounded-2xl md:rounded-[32px] overflow-hidden shadow-[4px_4px_0px_rgba(29,29,31,0.05)] md:shadow-[12px_12px_0px_rgba(29,29,31,0.05)] relative">
                    <Sidebar />
                    <main className="flex-1 flex flex-col bg-bone relative w-full overflow-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
