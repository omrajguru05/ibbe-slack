'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X } from 'lucide-react'

interface CreateChannelModalProps {
    isOpen: boolean
    onClose: () => void
    onChannelCreated: () => void
}

export default function CreateChannelModal({ isOpen, onClose, onChannelCreated }: CreateChannelModalProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    if (!isOpen) return null

    const handleCreate = async () => {
        if (!name.trim()) {
            alert('Please enter a channel name')
            return
        }

        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '-')

            const { error } = await supabase
                .from('channels')
                .insert({
                    name,
                    slug,
                    description,
                    created_by: user.id
                })

            if (error) throw error

            setName('')
            setDescription('')
            onChannelCreated()
            onClose()
        } catch (error: any) {
            alert(error.message || 'Error creating channel')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-cream border-2 border-charcoal rounded-xl p-6 w-full max-w-md shadow-[8px_8px_0px_#1d1d1f]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl font-bold text-charcoal">Create Channel</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-bone rounded-lg transition-colors"
                    >
                        <X size={24} className="text-charcoal" />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="font-mono text-sm font-bold text-charcoal uppercase block mb-2">
                            Channel Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-bone border-2 border-charcoal rounded-lg p-3 font-sans text-charcoal outline-none focus:shadow-[4px_4px_0px_rgba(29,29,31,0.1)] transition-shadow"
                            placeholder="awesome-channel"
                        />
                    </div>

                    <div>
                        <label className="font-mono text-sm font-bold text-charcoal uppercase block mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-bone border-2 border-charcoal rounded-lg p-3 font-sans text-charcoal outline-none focus:shadow-[4px_4px_0px_rgba(29,29,31,0.1)] transition-shadow resize-none"
                            placeholder="What's this channel about?"
                        />
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-bone text-charcoal font-mono font-bold py-3 rounded-lg border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={loading || !name.trim()}
                            className="flex-1 bg-charcoal text-bone font-mono font-bold py-3 rounded-lg border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
