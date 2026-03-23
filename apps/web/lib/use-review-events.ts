'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface ReviewEvent {
    reviewId: string;
    type: string;
    queueName: string;
    stage: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    details?: Record<string, unknown>;
    timestamp?: string;
}

const STREAMING_URL = process.env.NEXT_PUBLIC_STREAMING_URL || 'http://localhost:5002';

interface UseReviewEventsOptions {
    reviewId: string;
    onEvent?: (event: ReviewEvent) => void;
    onError?: (error: Event) => void;
    onConnect?: () => void;
}

export function useReviewEvents({ reviewId, onEvent, onError, onConnect }: UseReviewEventsOptions) {
    const [events, setEvents] = useState<ReviewEvent[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (!reviewId) return;

        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const eventSource = new EventSource(`${STREAMING_URL}/stream/${reviewId}`);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            setIsConnected(true);
            setError(null);
            onConnect?.();
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'connected') {
                    return;
                }

                const reviewEvent: ReviewEvent = {
                    ...data,
                    timestamp: new Date().toISOString(),
                };

                setEvents((prev) => [...prev, reviewEvent]);
                onEvent?.(reviewEvent);
            } catch {
                console.error('Failed to parse SSE event');
            }
        };

        eventSource.onerror = (err) => {
            setIsConnected(false);
            setError('Connection lost');
            onError?.(err);

            eventSource.close();
            eventSourceRef.current = null;

            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, 3000);
        };
    }, [reviewId, onEvent, onError, onConnect]);

    useEffect(() => {
        connect();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]);

    return {
        events,
        isConnected,
        error,
        clearEvents: () => setEvents([]),
    };
}
