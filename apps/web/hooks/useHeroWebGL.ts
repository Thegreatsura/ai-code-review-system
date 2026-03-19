import { useCallback, useEffect, useRef } from 'react';
import { compileShader, coverTransform, loadTexture } from '@/lib/webgl';
import { FRAG_SRC, VERT_SRC } from '@/shaders/hero';

interface UseHeroWebGLOptions {
    sectionRef: React.RefObject<HTMLDivElement | null>;
    cssOverlay: React.RefObject<HTMLDivElement | null>;
}

export function useHeroWebGL({ sectionRef, cssOverlay }: UseHeroWebGLOptions) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const isHover = useRef(false);
    const revealRef = useRef(0);
    const rafId = useRef<number | null>(null);
    const ditherSize = useRef({ w: 1, h: 1 });
    const heroSize = useRef({ w: 1, h: 1 });

    const setDitherCover = useRef<((v: [number, number, number, number]) => void) | null>(null);
    const setHeroCover = useRef<((v: [number, number, number, number]) => void) | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const section = sectionRef.current;
        if (!section) return;

        const gl = (() => {
            try {
                return (
                    canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true }) ??
                    (canvas.getContext('experimental-webgl', {
                        antialias: false,
                        alpha: false,
                        preserveDrawingBuffer: true,
                    }) as WebGLRenderingContext | null)
                );
            } catch {
                return null;
            }
        })();

        if (!gl) {
            canvas.style.display = 'none';
            if (cssOverlay.current) cssOverlay.current.style.display = 'block';
            return;
        }
        if (cssOverlay.current) cssOverlay.current.style.display = 'none';

        gl.clearColor(0.04, 0.04, 0.04, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const prog = gl.createProgram()!;
        gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT_SRC));
        gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error('Link error:', gl.getProgramInfoLog(prog));
            return;
        }
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(prog, 'a_pos');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const uMouse = gl.getUniformLocation(prog, 'u_mouse');
        const uAspect = gl.getUniformLocation(prog, 'u_aspect');
        const uReveal = gl.getUniformLocation(prog, 'u_reveal');
        const uTime = gl.getUniformLocation(prog, 'u_time');
        const uDither = gl.getUniformLocation(prog, 'u_dither');
        const uHero = gl.getUniformLocation(prog, 'u_hero');
        const uCoverDither = gl.getUniformLocation(prog, 'u_cover_dither');
        const uCoverHero = gl.getUniformLocation(prog, 'u_cover_hero');

        gl.uniform1i(uDither, 0);
        gl.uniform1i(uHero, 1);

        const applyCovers = () => {
            const { width: cw, height: ch } = section.getBoundingClientRect();
            const d = coverTransform(ditherSize.current.w, ditherSize.current.h, cw, ch);
            const h = coverTransform(heroSize.current.w, heroSize.current.h, cw, ch);
            gl.uniform4f(uCoverDither, ...d);
            gl.uniform4f(uCoverHero, ...h);
        };

        setDitherCover.current = () => applyCovers();
        setHeroCover.current = () => applyCovers();

        loadTexture(gl, '/images/hero-dither.png', 0, (w, h) => {
            ditherSize.current = { w, h };
            applyCovers();
        });
        loadTexture(gl, '/images/hero.png', 1, (w, h) => {
            heroSize.current = { w, h };
            applyCovers();
        });

        const resize = () => {
            const { width: w, height: h } = section.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio, 2);
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1f(uAspect, w / h);
            applyCovers();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(section);

        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
        const start = performance.now();

        const tick = () => {
            rafId.current = requestAnimationFrame(tick);

            revealRef.current = lerp(revealRef.current, isHover.current ? 1 : 0, 0.055);

            gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
            gl.uniform1f(uReveal, revealRef.current);
            gl.uniform1f(uTime, (performance.now() - start) / 1000);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        };
        tick();

        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
            ro.disconnect();
        };
    }, [sectionRef, cssOverlay]);

    const onMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const r = sectionRef.current?.getBoundingClientRect();
            if (!r) return;

            mouseRef.current = {
                x: (e.clientX - r.left) / r.width,
                y: (e.clientY - r.top) / r.height,
            };
        },
        [sectionRef],
    );

    const onMouseEnter = useCallback(() => {
        isHover.current = true;
    }, []);

    const onMouseLeave = useCallback(() => {
        isHover.current = false;
    }, []);

    return {
        canvasRef,
        onMouseMove,
        onMouseEnter,
        onMouseLeave,
    };
}
