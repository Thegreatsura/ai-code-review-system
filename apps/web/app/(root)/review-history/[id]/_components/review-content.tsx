'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowDown } from 'lucide-react';
import { lazy, memo, Suspense, useCallback, useMemo, useState } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ReviewHistoryItem } from '@/lib/review';
import { fetchReviewById } from '@/lib/review';
import type { ReviewEvent } from '@/lib/use-review-events';
import { useReviewEvents } from '@/lib/use-review-events';
import { EventList } from './event-list';
import { ReviewHeader } from './review-header';

const ReviewInfo = lazy(() => import('./review-info').then((mod) => ({ default: mod.ReviewInfo })));
const EventDetails = lazy(() => import('./event-details').then((mod) => ({ default: mod.EventDetails })));

type Props = {
    id: string;
};

const MemoizedReviewHeader = memo(ReviewHeader);
const MemoizedReviewInfo = memo(ReviewInfo);
const MemoizedEventList = memo(EventList);
const MemoizedEventDetails = memo(EventDetails);

export const ReviewContent = ({ id }: Props) => {
    const { events, isLoading } = useReviewEvents({
        reviewId: id,
        fetchSavedEvents: true,
    });

    const { data: review } = useQuery({
        queryKey: ['review', id],
        queryFn: () => fetchReviewById(id),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const [selectedEvent, setSelectedEvent] = useState<ReviewEvent | null>(null);
    const [now] = useState(() => Date.now());

    const timestamped = useMemo(
        () => events.filter((e): e is ReviewEvent & { timestamp: string } => typeof e.timestamp === 'string'),
        [events],
    );

    const { totalMs, queuedAt, startedAt } = useMemo(() => {
        if (timestamped.length < 2) {
            return { totalMs: 0, queuedAt: null, startedAt: null };
        }

        const firstTimestamp = timestamped[0].timestamp;
        const lastTimestamp = timestamped[timestamped.length - 1].timestamp;

        return {
            totalMs: new Date(lastTimestamp).getTime() - new Date(firstTimestamp).getTime(),
            queuedAt: firstTimestamp,
            startedAt: firstTimestamp,
        };
    }, [timestamped]);

    const processedEvents = useMemo(() => {
        if (timestamped.length === 0) return [];

        const startTime = new Date(timestamped[0].timestamp).getTime();
        const lastTime = new Date(timestamped[timestamped.length - 1].timestamp).getTime();
        const totalDuration = Math.max(lastTime - startTime, 1000);

        return timestamped.map((event, index) => {
            const currentTime = new Date(event.timestamp).getTime();
            const nextTs = timestamped[index + 1]?.timestamp;
            const nextTime = nextTs ? new Date(nextTs).getTime() : event.status === 'pending' ? now : currentTime + 500;

            const startOffset = ((currentTime - startTime) / totalDuration) * 100;
            const durationMs = nextTime - currentTime;
            const width = Math.max((durationMs / totalDuration) * 100, 2);

            return { ...event, startOffset, width, durationMs };
        });
    }, [timestamped, now]);

    const handleEventSelect = useCallback((event: ReviewEvent) => {
        setSelectedEvent(event);
    }, []);

    return (
        <div className="h-full text-neutral-300 selection:bg-orange-500/30 p-6 font-mono">
            <div className="mx-auto max-w-7xl flex flex-col border rounded-lg border-neutral-200">
                <MemoizedReviewHeader
                    isLoading={isLoading}
                    repositoryFullName={review?.repository?.fullName}
                    prUrl={review?.prUrl}
                />

                <div className="grid grid-cols-2 border-b border-neutral-200">
                    <div className="border-r border-neutral-200 flex flex-col">
                        <div className="h-[141px] border-b border-neutral-200 flex flex-col justify-between">
                            <MemoizedReviewInfo
                                prNumber={review?.prNumber ?? id}
                                repositoryFullName={review?.repository?.fullName ?? 'Unknown'}
                                totalMs={totalMs}
                                queuedAt={queuedAt}
                                startedAt={startedAt}
                                prUrl={review?.prUrl}
                            />

                            <div className="px-2.5 py-2">
                                <button className="flex items-center gap-2 px-1.5 cursor-pointer w-fit text-black">
                                    <span className="text-black text-sm font-medium">Trace</span>
                                    <ArrowDown size={14} />
                                </button>
                            </div>
                        </div>

                        <Suspense fallback={<EventListSkeleton />}>
                            <MemoizedEventList
                                events={processedEvents}
                                isLoading={isLoading}
                                onEventSelect={handleEventSelect}
                            />
                        </Suspense>
                    </div>

                    <Suspense fallback={<EventDetailsSkeleton />}>
                        <MemoizedEventDetails selectedEvent={selectedEvent} />
                    </Suspense>
                </div>
                <PReviewAndIssues review={review} />
            </div>
        </div>
    );
};

type PReviewAndIssuesProps = {
    review: ReviewHistoryItem | undefined;
};

const markdownComponents: Components = {
    code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        const isInline = !match;

        return isInline ? (
            <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-sm text-neutral-800 font-mono" {...props}>
                {children}
            </code>
        ) : (
            <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" className="rounded-md my-2 text-sm">
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        );
    },
    p({ children }) {
        return <p className="mb-3 text-neutral-700 leading-relaxed">{children}</p>;
    },
    h1({ children }) {
        return <h1 className="text-xl font-semibold text-neutral-900 mb-3 mt-4">{children}</h1>;
    },
    h2({ children }) {
        return <h2 className="text-lg font-semibold text-neutral-900 mb-2 mt-3">{children}</h2>;
    },
    h3({ children }) {
        return <h3 className="text-base font-semibold text-neutral-900 mb-2 mt-2">{children}</h3>;
    },
    ul({ children }) {
        return <ul className="list-disc list-inside mb-3 text-neutral-700 space-y-1">{children}</ul>;
    },
    ol({ children }) {
        return <ol className="list-decimal list-inside mb-3 text-neutral-700 space-y-1">{children}</ol>;
    },
    li({ children }) {
        return <li className="text-neutral-700">{children}</li>;
    },
    blockquote({ children }) {
        return (
            <blockquote className="border-l-4 border-neutral-300 pl-4 my-3 italic text-neutral-600">
                {children}
            </blockquote>
        );
    },
    a({ href, children }) {
        return (
            <a href={href} className="text-blue-600 hover:underline">
                {children}
            </a>
        );
    },
    strong({ children }) {
        return <strong className="font-semibold text-neutral-900">{children}</strong>;
    },
    em({ children }) {
        return <em className="italic">{children}</em>;
    },
};

const SeverityBadge = ({ severity }: { severity: string }) => {
    const colors: Record<string, string> = {
        error: 'bg-red-100 text-red-700 border-red-200',
        warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        info: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    const colorClass = colors[severity.toLowerCase()] || colors.info;

    return <span className={`px-2 py-0.5 text-xs font-medium rounded border ${colorClass}`}>{severity}</span>;
};

const PReviewAndIssues = ({ review }: PReviewAndIssuesProps) => {
    if (!review) return null;

    return (
        <div className="">
            <div className="grid grid-cols-2">
                <div className="border-r border-neutral-200">
                    <h3 className="text-sm px-4 py-2 font-semibold text-neutral-900 mb-2 pb-2 border-b border-neutral-200">
                        PR Review
                    </h3>
                    <div className="text-sm overflow-auto px-4 max-h-[400px]">
                        <ReactMarkdown components={markdownComponents}>
                            {review.review || 'No review available'}
                        </ReactMarkdown>
                    </div>
                </div>

                <div className="">
                    <h3 className="text-sm px-4 py-2 font-semibold text-neutral-900 mb-2 pb-2 border-b border-neutral-200">
                        PR Issues ({review.issues?.length || 0})
                    </h3>
                    <div className="text-sm px-4 overflow-auto max-h-[400px] space-y-3">
                        {review.issues && review.issues.length > 0 ? (
                            review.issues.map((issue, index) => (
                                <div key={index} className="border border-neutral-200 rounded p-2 bg-neutral-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-mono text-neutral-600">
                                            {issue.file}:{issue.line}
                                        </span>
                                        <SeverityBadge severity={issue.severity} />
                                    </div>
                                    <p className="text-neutral-700 mb-2">{issue.description}</p>
                                    {issue.diff.oldCode && (
                                        <div className="mb-2">
                                            <p className="text-xs text-neutral-500 mb-1">Old Code:</p>
                                            <SyntaxHighlighter
                                                style={vscDarkPlus}
                                                language="typescript"
                                                PreTag="div"
                                                className="rounded text-xs"
                                            >
                                                {issue.diff.oldCode}
                                            </SyntaxHighlighter>
                                        </div>
                                    )}
                                    {issue.diff.newCode && (
                                        <div>
                                            <p className="text-xs text-neutral-500 mb-1">New Code:</p>
                                            <SyntaxHighlighter
                                                style={vscDarkPlus}
                                                language="typescript"
                                                PreTag="div"
                                                className="rounded text-xs"
                                            >
                                                {issue.diff.newCode}
                                            </SyntaxHighlighter>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-neutral-500">No issues found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const EventListSkeleton = () => (
    <div className="flex flex-col gap-2 py-2 px-3">
        {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-neutral-100 rounded animate-pulse" />
        ))}
    </div>
);

const EventDetailsSkeleton = () => (
    <div className="py-2 px-4 bg-neutral-50/30">
        <div className="space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-24 animate-pulse" />
            <div className="h-8 bg-neutral-200 rounded w-full animate-pulse" />
            <div className="h-8 bg-neutral-200 rounded w-full animate-pulse" />
        </div>
    </div>
);
