'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { X, MessageSquare } from 'lucide-react'

interface Profile {
    id: string
    username: string
    avatar_url: string
    status: 'online' | 'offline' | 'busy'
    bio?: string
}

interface UserProfileModalProps {
    isOpen: boolean
    onClose: () => void
    user: Profile | null
    currentUser: Profile | null
}

export default function UserProfileModal({ isOpen, onClose, user, currentUser }: UserProfileModalProps) {
    const modalRef = useRef<HTMLDivElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen) {
            gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" })
            gsap.fromTo(modalRef.current,
                { y: 50, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
            )
        }
    }, [isOpen])

    const handleClose = () => {
        gsap.to(modalRef.current, { y: 20, opacity: 0, scale: 0.95, duration: 0.2 })
        gsap.to(overlayRef.current, {
            opacity: 0, duration: 0.2, onComplete: () => {
                onClose()
            }
        })
    }

    if (!isOpen || !user) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-charcoal/20 backdrop-blur-sm opacity-0"
                onClick={handleClose}
            ></div>
            <div
                ref={modalRef}
                className="bg-cream border-2 border-charcoal rounded-2xl w-full max-w-sm overflow-hidden shadow-[8px_8px_0px_#1d1d1f] relative z-10"
            >
                {/* Header / Banner */}
                <div className="h-24 bg-bone border-b-2 border-charcoal relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-3 right-3 p-1.5 bg-white border-2 border-charcoal rounded-full hover:bg-gray-100 transition-colors z-10"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Avatar & Info */}
                <div className="px-6 pb-6 -mt-12 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-2 border-charcoal bg-gray-200 overflow-hidden mb-4 relative z-10">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-bone text-charcoal font-bold text-2xl">
                                {user.username?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                    </div>

                    <h2 className="font-display text-2xl font-bold text-charcoal mb-1">{user.username}</h2>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-charcoal text-xs font-bold mb-4 ${user.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="uppercase">{user.status}</span>
                    </div>

                    {user.bio && (
                        <p className="text-center text-charcoal/80 font-mono text-sm mb-6 leading-relaxed">
                            {user.bio}
                        </p>
                    )}

                    {/* Actions */}
                    {currentUser?.id !== user.id && (
                        <button className="w-full bg-charcoal text-bone font-mono font-bold py-2.5 rounded-lg border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2">
                            <MessageSquare size={18} />
                            Message
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
