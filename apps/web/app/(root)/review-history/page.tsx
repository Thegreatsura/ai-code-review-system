'use client';

import { Activity, BookMarked, Check, ChevronLeft, ListFilter, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useReviewHistory } from '@/lib/review';
import { Review } from './_components/review';

const ReviewHistoryPage = () => {
    const { data: reviews, isLoading } = useReviewHistory();
    const [searchQuery, setSearchQuery] = useState('');
    const [repoSearchQuery, setRepoSearchQuery] = useState('');
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const [popoverView, setPopoverView] = useState<'main' | 'repos' | 'status'>('main');
    const [sortBy, setSortBy] = useState<'name' | null>('name');

    const statuses = ['pending', 'completed', 'failed'];

    useEffect(() => {
        if (!isPopoverOpen) {
            setTimeout(() => setPopoverView('main'), 200);
        }
    }, [isPopoverOpen]);

    const uniqueRepositories = useMemo(() => {
        if (!reviews) return [];
        const repoNames = reviews.map((review) => review.repository.name);
        return [...new Set(repoNames)];
    }, [reviews]);

    const filteredReposInPopover = useMemo(() => {
        return uniqueRepositories.filter((repo) => repo.toLowerCase().includes(repoSearchQuery.toLowerCase()));
    }, [uniqueRepositories, repoSearchQuery]);

    const filteredReviews = useMemo(() => {
        if (!reviews) return [];

        let result = reviews.filter((review) => {
            const matchesSearch =
                searchQuery === '' ||
                review.prTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                review.repository.name.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRepo = selectedRepo === null || review.repository.name === selectedRepo;

            const matchesStatus =
                selectedStatus === null || review.status?.toLowerCase() === selectedStatus.toLowerCase();

            return matchesSearch && matchesRepo && matchesStatus;
        });

        if (sortBy === 'name') {
            result = [...result].sort((a, b) => a.repository.name.localeCompare(b.repository.name));
        }

        return result;
    }, [reviews, searchQuery, selectedRepo, selectedStatus, sortBy]);

    const handleRepoSelect = useCallback((repoName: string) => {
        setSelectedRepo((prev) => (prev === repoName ? null : repoName));
        setIsPopoverOpen(false);
    }, []);

    const handleStatusSelect = useCallback((status: string) => {
        setSelectedStatus((prev) => (prev === status ? null : status));
        setIsPopoverOpen(false);
    }, []);

    return (
        <div className="min-h-screen text-neutral-300 selection:bg-orange-500/30">
            <div className="px-6 py-6 w-full max-w-7xl mx-auto">
                <div className="mb-6 w-full flex items-center gap-2">
                    <div className="w-full border border-[#242424] px-2 py-2 focus-within:bg-[#242424]/35 transition-colors ease-in-out duration-200 flex items-center gap-2 rounded-md">
                        <Search className="text-[#787878]" size={14} />
                        <input
                            className="w-full outline-none placeholder:text-[#787878] text-xs font-medium border-0"
                            placeholder="Search Projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger>
                            <button
                                className={`border border-[#242424] hover:bg-[#242424]/35 group px-2 py-2 rounded-md transition-colors ease-in-out duration-200 ${selectedRepo || selectedStatus ? 'bg-[#242424]/50' : ''}`}
                            >
                                <ListFilter className="text-white" size={17} />
                            </button>
                        </PopoverTrigger>

                        <PopoverContent
                            className="w-[280px] p-0 bg-[#2A2A2A] border-black shadow-2xl overflow-hidden"
                            align="end"
                        >
                            {popoverView === 'main' ? (
                                <div className="flex flex-col py-2">
                                    <div className="px-4 py-2 text-[12px] font-medium text-neutral-500 font-mono">
                                        Filter by
                                    </div>
                                    <button
                                        onClick={() => setPopoverView('repos')}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-800 font-medium font-mono transition-colors text-sm text-white"
                                    >
                                        <BookMarked size={14} className="text-neutral-400" />
                                        Repository
                                    </button>
                                    <button
                                        onClick={() => setPopoverView('status')}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-800 font-medium font-mono transition-colors text-sm text-white"
                                    >
                                        <Activity size={14} className="text-neutral-400" />
                                        Status
                                    </button>

                                    <div className="h-0.5 shadow-[0px_-0.5px_0px_0px_rgba(255,252,252,0.3)_inset] bg-black my-2" />

                                    <div className="px-4 py-2 text-[12px] font-medium text-neutral-500 font-mono">
                                        Sort by
                                    </div>
                                    <button
                                        onClick={() => setSortBy(sortBy === 'name' ? null : 'name')}
                                        className="flex items-center justify-between w-full px-4 py-2 hover:bg-neutral-800 transition-colors text-sm text-white font-medium font-mono"
                                    >
                                        <span className="tracking-wider">Name</span>
                                        {sortBy === 'name' && <Check size={16} className="text-[#e6edf3]" />}
                                    </button>
                                </div>
                            ) : popoverView === 'repos' ? (
                                <div className="flex flex-col h-[350px]">
                                    <div className="px-2 py-1 border-b border-black flex items-center gap-1">
                                        <button
                                            onClick={() => setPopoverView('main')}
                                            className="p-1 hover:bg-neutral-800 rounded text-neutral-500 mt-0.5"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <div className="relative flex-1">
                                            <div className="px-3 py-1.5">
                                                <input
                                                    type="text"
                                                    value={repoSearchQuery}
                                                    onChange={(e) => setRepoSearchQuery(e.target.value)}
                                                    placeholder="Search..."
                                                    className="w-full text-white placeholder:text-neutral-500 font-mono text-xs outline-none transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto py-1 shadow-[0px_0.5px_0px_0px_rgba(255,252,252,0.3)_inset]">
                                        {filteredReposInPopover.length > 0 ? (
                                            filteredReposInPopover.map((repo) => (
                                                <button
                                                    key={repo}
                                                    onClick={() => handleRepoSelect(repo)}
                                                    className={`w-full flex items-center gap-3 px-4 py-2 text-xs text-white font-mono hover:bg-neutral-800 transition-colors ${selectedRepo === repo ? 'bg-neutral-700' : ''}`}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                                    </svg>
                                                    <span className="truncate flex-1 text-left line-clamp-1">
                                                        {repo}
                                                    </span>
                                                    {selectedRepo === repo && (
                                                        <Check size={14} className="text-white" />
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-xs text-neutral-500 font-mono">
                                                No repositories found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    <div className="px-2 py-2 border-b border-black flex items-center gap-2">
                                        <button
                                            onClick={() => setPopoverView('main')}
                                            className="p-1 hover:bg-neutral-800 rounded text-neutral-500"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="text-white font-mono text-xs font-bold tracking-tight">
                                            Status
                                        </span>
                                    </div>

                                    <div className="flex flex-col py-1 shadow-[0px_0.5px_0px_0px_rgba(255,252,252,0.3)_inset]">
                                        {statuses.map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusSelect(status)}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-white font-mono hover:bg-neutral-800 transition-colors ${selectedStatus === status ? 'bg-neutral-700/50' : ''}`}
                                            >
                                                <div className="flex items-center gap-3 capitalize">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${
                                                            status === 'completed'
                                                                ? 'bg-green-500'
                                                                : status === 'pending'
                                                                  ? 'bg-orange-500'
                                                                  : 'bg-red-500'
                                                        }`}
                                                    />
                                                    {status}
                                                </div>
                                                {selectedStatus === status && (
                                                    <Check size={14} className="text-white" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>

                {isLoading ? (
                    <div className="py-20 text-center font-mono text-xs text-neutral-600 tracking-[0.2em] animate-pulse">
                        LOADING_DATA...
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="py-20 text-center font-mono text-xs text-neutral-600 tracking-[0.2em]">
                        NO_REVIEWS_FOUND
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredReviews.map((review) => (
                            <Review review={review} key={review.id} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewHistoryPage;
