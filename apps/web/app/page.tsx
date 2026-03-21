'use client';

import { Red_Hat_Display } from 'next/font/google';
import Link from 'next/link';
import { useRef } from 'react';
import { DitherImage } from '@/components/globals/dither-image';
import { useCssFallback } from '@/hooks/useCssFallback';
import { cn } from '@/lib/utils';

const redhat = Red_Hat_Display({
    variable: '--font-red-hat',
    subsets: ['latin'],
});

const HomePage = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const cssOverlay = useRef<HTMLDivElement>(null);

    const css = useCssFallback(sectionRef, cssOverlay);

    return (
        <div className={cn('relative bg-[#0A0A0A]', redhat.className)}>
            <div className="h-16 fixed z-90 w-full bg-[#0A0A0A] border-b border-neutral-500/20 flex justify-center">
                <div className="w-325 flex items-center pl-4 border-x border-neutral-500/20">
                    <div className="text-base font-semibold tracking-tight text-white flex items-center gap-1">
                        <span>Open</span>
                        <span className="bg-orange-500 px-1.5 text-black mr-px font-bold rounded">Review</span>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-325 mx-auto border-x border-neutral-500/20  flex flex-col">
                <div
                    ref={sectionRef}
                    className="relative h-dvh overflow-hidden"
                    onMouseMove={css.onMouseMove}
                    onMouseEnter={css.onMouseEnter}
                    onMouseLeave={css.onMouseLeave}
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: "url('/images/hero-dither.png')" }}
                    />

                    <div
                        ref={cssOverlay}
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
                        style={{ backgroundImage: "url('/images/hero.png')", opacity: 0 }}
                    />

                    <div className="relative z-10 p-6 flex flex-col gap-4 h-full">
                        <div className="flex flex-col items-center justify-center pt-32 gap-5 w-full">
                            <span className="uppercase text-white text-xs font-sans">Automated Code Review</span>
                            <div className="flex flex-col items-center justify-center gap-2">
                                <h1 className="text-white font-medium text-3xl">
                                    Review smarter. Ship faster with AI.
                                </h1>
                                <p className="text-neutral-400 text-sm max-w-80 text-center">
                                    Automate code reviews with AI. Get instant feedback on pull requests.
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-3 mt-2">
                                <Link
                                    href="/repositories"
                                    className="text-black bg-orange-500 px-4 py-1.75 text-sm font-medium hover:bg-orange-400 transition-colors"
                                >
                                    Start Free
                                </Link>
                                <button className="relative hover:bg-orange-900/30 text-white px-3 py-2 text-sm font-medium border border-orange-900/30 transition-colors">
                                    <span className="absolute top-0 left-0 h-2 w-2 border-t border-l border-orange-500 transition-colors group-hover:border-white" />
                                    <span className="absolute top-0 right-0 h-2 w-2 border-t border-r border-orange-500 transition-colors group-hover:border-white" />
                                    <span className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-orange-500 transition-colors group-hover:border-white" />
                                    <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-orange-500 transition-colors group-hover:border-white" />
                                    Watch Demo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="w-full h-24 border-y border-neutral-500/20 bg-[#1C1B1B]
         bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_11px)]"
                ></div>
                <div className="flex h-dvh items-center w-full">
                    <div className="grid flex-1 relative gap-2 grid-cols-2 border-y border-neutral-500/20 h-137.5">
                        <span className="absolute top-0 left-0 h-2 w-2 border-t border-l border-orange-500 transition-colors group-hover:border-white" />
                        <span className="absolute top-0 right-0 h-2 w-2 border-t border-r border-orange-500 transition-colors group-hover:border-white" />
                        <span className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-orange-500 transition-colors group-hover:border-white" />
                        <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-orange-500 transition-colors group-hover:border-white" />

                        <div className="overflow-hidden relative p-1 group">
                            <DitherImage src="/images/section.png" pixelation={3} quantization={5} grayscale />
                            <img
                                src="/images/repo-list.png"
                                alt="Repository Overview"
                                className="absolute bottom-0 right-0 w-[90%] translate-y-1 translate-x-1 rounded-tl-lg h-[88%] object-cover object-top-left z-20"
                            />
                        </div>
                        <div className="bg-[#121212] flex flex-col justify-center p-16 gap-6">
                            <span className="text-neutral-500 text-xs ">Change Validation</span>
                            <h1 className="text-white text-5xl font-medium">Block risky changes before release</h1>
                            <p className="text-neutral-500 text-base font-medium">
                                Automatically validate cost, logic, and configuration changes during reviews so nothing
                                unnoticed.
                            </p>
                            <Link
                                href="/repositories"
                                className="flex shadow-[0px_0.75px_0px_0px_rgba(255,252,252,0.3)_inset,0px_1px_5px_0px_rgba(0,0,0,0.75)] border border-black rounded-lg items-center gap-3 px-3 py-2 bg-linear-to-b from-[#444444] to-[#292929] text-white w-fit transition-colors ease-in-out duration-150 text-sm font-bold"
                            >
                                Get Started Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
