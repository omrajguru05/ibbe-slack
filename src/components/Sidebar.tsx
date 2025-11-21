'use client'

import { LogOut, Plus, Hash, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import CreateChannelModal from './CreateChannelModal'
import UserProfileModal from './UserProfileModal'
import { useSidebar } from '@/context/SidebarContext'

interface Profile {
    id: string
    username: string
    avatar_url: string
    status: 'online' | 'offline' | 'busy'
    bio?: string
}

interface Channel {
    id: string
    name: string
    slug: string
    created_at: string
}

export default function Sidebar() {
    const [users, setUsers] = useState<Profile[]>([])
    const [channels, setChannels] = useState<Channel[]>([])
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
    const supabase = createClient()
    const router = useRouter()
    const pathname = usePathname()
    const { isOpen, close } = useSidebar()

    const currentChannelSlug = pathname?.split('/')[2] || 'general'

    useEffect(() => {
        const initializePresence = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setCurrentUserId(user.id)

            await supabase
                .from('profiles')
                .update({ status: 'online', last_seen: new Date().toISOString() })
                .eq('id', user.id)

            const fetchUsers = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url, status, bio')
                    .order('username')

                if (data) {
                    setUsers(data)
                }
            }

            const fetchChannels = async () => {
                const { data } = await supabase
                    .from('channels')
                    .select('*')
                    .order('created_at')

                if (data) {
                    setChannels(data)
                }
            }

            await fetchUsers()
            await fetchChannels()

            const profilesChannel = supabase
                .channel('profiles-changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'profiles',
                    },
                    () => {
                        fetchUsers()
                    }
                )
                .subscribe()

            const channelsChannel = supabase
                .channel('channels-changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'channels',
                    },
                    () => {
                        fetchChannels()
                    }
                )
                .subscribe()

            const heartbeat = setInterval(async () => {
                await supabase
                    .from('profiles')
                    .update({ last_seen: new Date().toISOString() })
                    .eq('id', user.id)
            }, 30000)

            return () => {
                clearInterval(heartbeat)
                supabase.removeChannel(profilesChannel)
                supabase.removeChannel(channelsChannel)
            }
        }

        initializePresence()
    }, [supabase])

    useEffect(() => {
        return () => {
            if (currentUserId) {
                supabase
                    .from('profiles')
                    .update({ status: 'offline' })
                    .eq('id', currentUserId)
            }
        }
    }, [currentUserId, supabase])

    const handleLogout = async () => {
        if (currentUserId) {
            await supabase
                .from('profiles')
                .update({ status: 'offline' })
                .eq('id', currentUserId)
        }
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleUserClick = (user: Profile) => {
        setSelectedUser(user)
    }

    const onlineUsers = users.filter(u => u.status === 'online')
    const offlineUsers = users.filter(u => u.status === 'offline' || u.status === 'busy')

    const currentUserProfile = users.find(u => u.id === currentUserId) || null

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={close}
                />
            )}

            <div className={`
                fixed inset-y-0 left-0 z-50 w-[280px] border-r-2 border-charcoal bg-cream flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Header */}
                <div className="h-20 border-b-2 border-charcoal flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-charcoal mr-2"></div>
                        <h1 className="font-display text-xl font-bold tracking-tight">IBBE_SLACK</h1>
                    </div>
                    <button onClick={close} className="md:hidden p-1 hover:bg-bone rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Channels */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <span className="font-mono text-xs font-bold text-gray">CHANNELS</span>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="cursor-pointer hover:text-charcoal text-gray transition-colors"
                                title="Create channel"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-1">
                            {channels.map((channel) => (
                                <div
                                    key={channel.id}
                                    onClick={() => {
                                        router.push(`/chat/${channel.slug}`)
                                        close()
                                    }}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-bone border-2 ${currentChannelSlug === channel.slug
                                        ? 'bg-bone border-charcoal shadow-[4px_4px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]'
                                        : 'border-transparent'
                                        }`}
                                >
                                    <Hash size={16} className="text-gray" />
                                    <span className="font-bold text-sm truncate">{channel.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Online Users */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <span className="font-mono text-xs font-bold text-gray">ONLINE — {onlineUsers.length}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            {onlineUsers.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => handleUserClick(user)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bone transition-colors cursor-pointer"
                                >
                                    <div className="relative">
                                        <div className="w-7 h-7 rounded-full border-2 border-charcoal overflow-hidden bg-gray-200 flex items-center justify-center">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-charcoal">{user.username?.[0]?.toUpperCase() || '?'}</span>
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-cream rounded-full"></div>
                                    </div>
                                    <span className="font-bold text-sm truncate">
                                        {user.username}{user.id === currentUserId ? ' (you)' : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Offline Users */}
                    {offlineUsers.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <span className="font-mono text-xs font-bold text-gray">OFFLINE — {offlineUsers.length}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {offlineUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => handleUserClick(user)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bone transition-colors opacity-60 cursor-pointer"
                                    >
                                        <div className="relative">
                                            <div className="w-7 h-7 rounded-full border-2 border-charcoal overflow-hidden bg-gray-200 flex items-center justify-center">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-charcoal">{user.username?.[0]?.toUpperCase() || '?'}</span>
                                                )}
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-400 border-2 border-cream rounded-full"></div>
                                        </div>
                                        <span className="font-bold text-sm truncate">{user.username}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Footer */}
                <div className="p-4 border-t-2 border-charcoal bg-bone">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream cursor-pointer transition-colors group" onClick={handleLogout}>
                        <div className="w-8 h-8 rounded-full bg-charcoal overflow-hidden relative flex items-center justify-center">
                            {users.find(u => u.id === currentUserId)?.avatar_url ? (
                                <img src={users.find(u => u.id === currentUserId)?.avatar_url} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-bold text-bone">{users.find(u => u.id === currentUserId)?.username?.[0]?.toUpperCase() || 'U'}</span>
                            )}
                            <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center">
                                <LogOut size={12} className="text-white" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{users.find(u => u.id === currentUserId)?.username || 'You'}</div>
                            <div className="text-[10px] font-mono text-gray">Online</div>
                        </div>
                    </div>
                </div>
            </div>

            <CreateChannelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onChannelCreated={() => { }}
            />

            <UserProfileModal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                user={selectedUser}
                currentUser={currentUserProfile}
            />
        </>
    )
}
