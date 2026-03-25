'use client';

import { memo } from 'react';
import type { ReviewEvent } from '@/lib/use-review-events';
import { formatMs } from '@/lib/utils';

type EventDetailsProps = {
    selectedEvent: ReviewEvent | null;
};

export const EventDetails = memo(({ selectedEvent }: EventDetailsProps) => {
    if (!selectedEvent) {
        return (
            <div className="py-2 px-4 bg-neutral-50/30">
                <div className="flex items-center justify-center h-full min-h-[200px]">
                    <span className="text-xs text-neutral-400">Select an event to view details</span>
                </div>
            </div>
        );
    }

    return (
        <div className="py-2 px-4 bg-neutral-50/30">
            <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase text-neutral-500 font-bold">Event Details</span>
                <div className="text-black text-xs space-y-2">
                    <p>
                        <span className="text-neutral-500">Stage:</span> {selectedEvent.stage}
                    </p>
                    <p>
                        <span className="text-neutral-500">Duration:</span> {formatMs(selectedEvent.durationMs || 0)}
                    </p>
                    <p>
                        <span className="text-neutral-500">Status:</span> {selectedEvent.status}
                    </p>
                </div>
            </div>
        </div>
    );
});

EventDetails.displayName = 'EventDetails';
