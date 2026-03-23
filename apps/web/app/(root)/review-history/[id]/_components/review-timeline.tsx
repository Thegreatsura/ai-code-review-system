'use client';

import { type ReviewEvent, useReviewEvents } from '@/lib/use-review-events';

const statusColors = {
    pending: 'bg-yellow-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
};

const statusTextColors = {
    pending: 'text-yellow-500',
    success: 'text-green-500',
    error: 'text-red-500',
};

function formatTimestamp(timestamp?: string): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function EventItem({ event }: { event: ReviewEvent }) {
    return (
        <div className="flex gap-4 py-4 border-b border-neutral-800/50 last:border-0">
            <div className="flex flex-col items-center">
                <div
                    className={`w-3 h-3 rounded-full ${statusColors[event.status]} ${event.status === 'pending' ? 'animate-pulse' : ''}`}
                />
                <div className="w-px h-full bg-neutral-800 mt-1" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs text-neutral-500 uppercase tracking-wider">
                        {event.queueName}
                    </span>
                    <span className={`font-mono text-xs ${statusTextColors[event.status]} uppercase`}>
                        {event.status}
                    </span>
                </div>
                <h4 className="text-sm font-medium text-white mb-1">{event.stage}</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">{event.message}</p>
                <div className="flex items-center gap-2 mt-2">
                    <span className="font-mono text-[10px] text-neutral-600">{formatTimestamp(event.timestamp)}</span>
                </div>
            </div>
        </div>
    );
}

function DetailModal({ event, onClose }: { event: ReviewEvent; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-lg w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Event Details</h3>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-neutral-500 uppercase tracking-wider">Type</label>
                        <p className="text-sm text-white font-mono mt-1">{event.type}</p>
                    </div>
                    <div>
                        <label className="text-xs text-neutral-500 uppercase tracking-wider">Stage</label>
                        <p className="text-sm text-white mt-1">{event.stage}</p>
                    </div>
                    <div>
                        <label className="text-xs text-neutral-500 uppercase tracking-wider">Status</label>
                        <p className={`text-sm mt-1 ${statusTextColors[event.status]} uppercase`}>{event.status}</p>
                    </div>
                    <div>
                        <label className="text-xs text-neutral-500 uppercase tracking-wider">Message</label>
                        <p className="text-sm text-neutral-300 mt-1">{event.message}</p>
                    </div>
                    <div>
                        <label className="text-xs text-neutral-500 uppercase tracking-wider">Queue</label>
                        <p className="text-sm text-white font-mono mt-1">{event.queueName}</p>
                    </div>
                    {event.details && Object.keys(event.details).length > 0 && (
                        <div>
                            <label className="text-xs text-neutral-500 uppercase tracking-wider">Details</label>
                            <pre className="text-xs text-neutral-400 mt-1 p-3 bg-neutral-950 rounded border border-neutral-800 overflow-x-auto">
                                {JSON.stringify(event.details, null, 2)}
                            </pre>
                        </div>
                    )}
                    {event.timestamp && (
                        <div>
                            <label className="text-xs text-neutral-500 uppercase tracking-wider">Timestamp</label>
                            <p className="text-sm text-neutral-300 mt-1">
                                {new Date(event.timestamp).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function ReviewTimeline({ reviewId }: { reviewId: string }) {
    const { events, isConnected, isLoading } = useReviewEvents({ reviewId, fetchSavedEvents: true });

    if (isLoading) {
        return (
            <div className="py-12 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/50 mb-4">
                    <div className="w-2 h-2 rounded-full bg-neutral-600 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                        Loading saved events...
                    </span>
                </div>
            </div>
        );
    }

    if (events.length === 0 && !isConnected) {
        return (
            <div className="py-12 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/50 mb-4">
                    <div className="w-2 h-2 rounded-full bg-neutral-600 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                        Waiting for events...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div
                    className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`}
                />
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                    {isConnected ? 'Live' : 'Disconnected'} • {events.length} events
                </span>
            </div>

            <div className="space-y-0">
                {events.map((event, index) => (
                    <div key={`${event.type}-${index}`}>
                        <EventItem event={event} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export { DetailModal };
