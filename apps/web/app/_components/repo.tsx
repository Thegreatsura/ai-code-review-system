import Link from 'next/link';
import { DitherImage } from '@/components/globals/dither-image';

export const RepoSection = () => {
    return (
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
                    <span className="text-neutral-500 text-xs ">Repository Dashboard</span>
                    <h1 className="text-white text-5xl font-medium">View and manage all your repositories</h1>
                    <p className="text-neutral-500 text-base font-medium">
                        Connect repositories to get AI-powered code reviews and automated quality checks for your
                        projects.
                    </p>
                    <Link
                        href="/repositories"
                        className="flex shadow-[0px_0.75px_0px_0px_rgba(255,252,252,0.3)_inset,0px_1px_5px_0px_rgba(0,0,0,0.75)] border border-black rounded-lg items-center gap-3 px-3 py-2 bg-linear-to-b from-[#444444] to-[#292929] hover:from-[#444444]/70 transition-colors ease-in-out duration-200 text-white w-fit text-sm font-bold"
                    >
                        Get Started Now
                    </Link>
                </div>
            </div>
        </div>
    );
};
