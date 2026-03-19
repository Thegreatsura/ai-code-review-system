import { useCallback, useEffect, useRef } from 'react';

export function useCssFallback(
    sectionRef: React.RefObject<HTMLDivElement | null>,
    overlayRef: React.RefObject<HTMLDivElement | null>,
) {
    const isHover = useRef(false);
    const revealRef = useRef(0);
    const rafId = useRef<number | null>(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });

    useEffect(() => {
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
        const tick = () => {
            rafId.current = requestAnimationFrame(tick);
            revealRef.current = lerp(revealRef.current, isHover.current ? 1 : 0, 0.055);
            const el = overlayRef.current;
            if (!el) return;
            const { x, y } = mouseRef.current;
            el.style.opacity = String(revealRef.current);
            el.style.webkitMaskImage = `radial-gradient(ellipse 95% 90% at ${x}px ${y}px, black 0%, black 40%, transparent 100%)`;
            el.style.maskImage = `radial-gradient(ellipse 95% 90% at ${x}px ${y}px, black 0%, black 40%, transparent 100%)`;
        };
        tick();
        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [overlayRef]);

    const onMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const r = sectionRef.current?.getBoundingClientRect();
            if (!r) return;
            mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
        },
        [sectionRef],
    );
    const onMouseEnter = useCallback(() => {
        isHover.current = true;
    }, []);
    const onMouseLeave = useCallback(() => {
        isHover.current = false;
    }, []);

    return { onMouseMove, onMouseEnter, onMouseLeave };
}
