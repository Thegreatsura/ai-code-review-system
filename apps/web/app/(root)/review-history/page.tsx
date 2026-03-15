'use client';

import { useReviewHistory } from '@/lib/review';

const ReviewHistoryPage = () => {
    const { data: reviews, isLoading, error } = useReviewHistory();

    return (
        <div className="min-h-screen bg-neutral-950 p-0 text-neutral-300">
            <div className="px-7 py-8">
                <div className={`mb-7 transition-all duration-500 ease-out opacity-100 translate-y-0`}>
                    <h1 className="mb-1.5 text-[22px] font-semibold tracking-wide text-neutral-200">Review History</h1>
                    <p className="font-mono text-xs text-neutral-500">List of reviews on the PR you opened.</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-5 h-5 border-2 border-[#242424] border-t-[#38bdf8] rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-12 text-red-400">
                        <span>Failed to load review history</span>
                    </div>
                ) : reviews && reviews.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <a
                                            href={review.prUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-neutral-200 hover:text-blue-400"
                                        >
                                            {review.prTitle}
                                        </a>
                                        <p className="text-xs text-neutral-500">
                                            {review.repository.fullName} • PR #{review.prNumber}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                            review.status === 'completed'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                        }`}
                                    >
                                        {review.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-12 text-neutral-500">
                        <span>No review history yet</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewHistoryPage;
