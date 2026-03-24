'use client';

import { useState } from 'react';
import type { ReviewEvent } from '@/lib/use-review-events';
import { DetailModal, ReviewTimeline } from './review-timeline';

type Props = {
    id: string;
};

export const ReviewContent = ({ id }: Props) => {
    const [selectedEvent, setSelectedEvent] = useState<ReviewEvent | null>(null);

    return (
        <div className="h-full text-neutral-300 selection:bg-orange-500/30">
            <div className="mx-auto px-6 py-6">
                <header className="mb-6">
                    <h1 className="text-4xl font-medium tracking-tight text-white mb-4">PR Review Detail</h1>
                    <p className="text-neutral-500 font-mono text-xs tracking-tight uppercase opacity-60">
                        Real-time progress of your AI Code Review
                    </p>
                </header>

                <div className="">
                    <ReviewTimeline reviewId={id} />
                </div>
            </div>

            {selectedEvent && <DetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
        </div>
    );
};
