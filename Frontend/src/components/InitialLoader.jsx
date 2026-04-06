import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../core/context/UserContext';

/**
 * InitialLoader Component
 * 
 * Replaces MUI with plain CSS while maintaining IDENTICAL UI/UX:
 * - Same animations (pulse rings, core glow, breathing, cursor blink, float)
 * - Same responsive breakpoints (xs, sm, md, lg)
 * - Same timing and transitions
 * - Same color scheme and gradients
 */
const InitialLoader = () => {
    const { isLoading } = useContext(AuthContext);
    const [minTimeElapsed, setMinTimeElapsed] = useState(false);
    const [phase, setPhase] = useState(0);
    // Phase 0: Logo centered
    // Phase 1: Logo splits apart
    // Phase 2: Logo vanishes
    // Phase 3: Brand name appears
    const [fadeOut, setFadeOut] = useState(false);
    const [unmount, setUnmount] = useState(false);

    // Minimum display time
    useEffect(() => {
        const timer = setTimeout(() => setMinTimeElapsed(true), 2800);
        return () => clearTimeout(timer);
    }, []);

    // Animation sequence
    useEffect(() => {
        const timer1 = setTimeout(() => setPhase(1), 500);
        const timer2 = setTimeout(() => setPhase(2), 1400);
        const timer3 = setTimeout(() => setPhase(3), 1800);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    const shouldShowLoader = isLoading || !minTimeElapsed;

    useEffect(() => {
        if (!shouldShowLoader) {
            setFadeOut(true);
        }
    }, [shouldShowLoader]);

    useEffect(() => {
        if (fadeOut) {
            const timer = setTimeout(() => setUnmount(true), 600);
            return () => clearTimeout(timer);
        }
    }, [fadeOut]);

    if (unmount) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#020617',
                opacity: fadeOut ? 0 : 1,
                transition: 'opacity 0.6s ease-out',
                overflow: 'hidden',
            }}
        >
            {/* CSS Keyframes */}
            <style>{`
                @keyframes pulse-ring {
                    0% {
                        transform: scale(0.7);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(2.8);
                        opacity: 0;
                    }
                }
                
                @keyframes pulse-ring-2 {
                    0% {
                        transform: scale(0.7);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(3.2);
                        opacity: 0;
                    }
                }
                
                @keyframes core-glow {
                    0%, 100% {
                        box-shadow: 0 0 60px rgba(59, 130, 246, 0.6), 0 0 120px rgba(59, 130, 246, 0.4), inset 0 0 40px rgba(255,255,255,0.1);
                    }
                    50% {
                        box-shadow: 0 0 80px rgba(59, 130, 246, 0.8), 0 0 160px rgba(59, 130, 246, 0.5), inset 0 0 60px rgba(255,255,255,0.15);
                    }
                }
                
                @keyframes breathe {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                
                @keyframes cursor-blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes glow-pulse {
                    0%, 100% { filter: drop-shadow(0 0 40px rgba(59, 130, 246, 0.6)); }
                    50% { filter: drop-shadow(0 0 60px rgba(59, 130, 246, 0.9)); }
                }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                /* Responsive container */
                .loader-pulse-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 200px;
                    height: 200px;
                }
                
                @media (min-width: 640px) {
                    .loader-pulse-container {
                        width: 250px;
                        height: 250px;
                    }
                }
                
                @media (min-width: 768px) {
                    .loader-pulse-container {
                        width: 300px;
                        height: 300px;
                    }
                }
                
                /* Pulse rings */
                .pulse-ring {
                    position: absolute;
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    border: 3px solid #3b82f6;
                    animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform, opacity;
                }
                
                .pulse-ring-2 {
                    position: absolute;
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    border: 2px solid #60a5fa;
                    animation: pulse-ring-2 2s cubic-bezier(0.4, 0, 0.2, 1) 0.5s infinite;
                    will-change: transform, opacity;
                }
                
                @media (min-width: 640px) {
                    .pulse-ring, .pulse-ring-2 {
                        width: 125px;
                        height: 125px;
                    }
                }
                
                @media (min-width: 768px) {
                    .pulse-ring {
                        width: 150px;
                        height: 150px;
                        border-width: 4px;
                    }
                    .pulse-ring-2 {
                        width: 150px;
                        height: 150px;
                        border-width: 3px;
                    }
                }
                
                /* Core circle */
                .core-circle {
                    position: relative;
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #1e40af 0%, #2563eb 40%, #3b82f6 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: core-glow 2s ease-in-out infinite;
                    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
                }
                
                @media (min-width: 640px) {
                    .core-circle {
                        width: 125px;
                        height: 125px;
                    }
                }
                
                @media (min-width: 768px) {
                    .core-circle {
                        width: 150px;
                        height: 150px;
                    }
                }
                
                /* Chevrons */
                .chevron-left, .chevron-right {
                    position: absolute;
                    width: 50px;
                    height: 50px;
                    transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out;
                    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 40px rgba(99, 240, 255, 0.6));
                }
                
                @media (min-width: 640px) {
                    .chevron-left, .chevron-right {
                        width: 60px;
                        height: 60px;
                    }
                }
                
                @media (min-width: 768px) {
                    .chevron-left, .chevron-right {
                        width: 70px;
                        height: 70px;
                    }
                }
                
                /* Brand text */
                .brand-container {
                    margin-top: 1rem;
                    text-align: center;
                }
                
                @media (min-width: 768px) {
                    .brand-container {
                        margin-top: 1.5rem;
                    }
                }
                
                .brand-title {
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    font-size: 2.5rem;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                
                @media (min-width: 640px) {
                    .brand-title {
                        font-size: 3.5rem;
                    }
                }
                
                @media (min-width: 768px) {
                    .brand-title {
                        font-size: 5rem;
                    }
                }
                
                @media (min-width: 1024px) {
                    .brand-title {
                        font-size: 5.5rem;
                    }
                }
                
                .brand-algo {
                    color: #ffffff;
                    text-shadow: 0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.3);
                }
                
                .brand-viz {
                    background: linear-gradient(90deg, #63f0ff, #00a8ff);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .tagline {
                    margin-top: 0.5rem;
                    font-family: "Fira Code", "Roboto Mono", monospace;
                    font-size: 0.75rem;
                    color: #94a3b8;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    animation: breathe 2s ease-in-out infinite;
                }
                
                @media (min-width: 640px) {
                    .tagline {
                        font-size: 0.875rem;
                    }
                }
                
                @media (min-width: 768px) {
                    .tagline {
                        margin-top: 0.75rem;
                        font-size: 1rem;
                        letter-spacing: 0.25em;
                    }
                }
                
                /* Status text */
                .status-text {
                    position: absolute;
                    bottom: 8%;
                    font-family: "Fira Code", "Roboto Mono", monospace;
                    font-size: 0.7rem;
                    color: #64748b;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    animation: breathe 2s ease-in-out infinite;
                }
                
                @media (min-width: 640px) {
                    .status-text {
                        font-size: 0.8rem;
                    }
                }
                
                @media (min-width: 768px) {
                    .status-text {
                        bottom: 12%;
                        font-size: 0.875rem;
                    }
                }
                
                .cursor-blink {
                    animation: cursor-blink 1s step-end infinite;
                    margin-left: 0.125rem;
                    color: #3b82f6;
                }
            `}</style>

            {/* Quantum Pulse Container */}
            <div className="loader-pulse-container">
                {/* Pulse Ring 1 */}
                <div className="pulse-ring" />

                {/* Pulse Ring 2 */}
                <div className="pulse-ring-2" />

                {/* Core Circle */}
                <div
                    className="core-circle"
                    style={{
                        opacity: phase >= 2 ? 0 : 1,
                        transform: phase >= 2 ? 'scale(0.5)' : 'scale(1)',
                    }}
                >
                    {/* SVG Logo - Wide Chevrons */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                        }}
                    >
                        {/* Left Chevron */}
                        <svg
                            viewBox="0 0 24 24"
                            className="chevron-left"
                            style={{
                                opacity: phase >= 2 ? 0 : 1,
                                transform: phase >= 1
                                    ? 'translateX(-50px) scale(1.15)'
                                    : 'translateX(-22px)',
                            }}
                        >
                            <defs>
                                <linearGradient id="chevron-gradient-left" x1="0" x2="1" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#ffffff" />
                                    <stop offset="100%" stopColor="#e0f7ff" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M15 6 L8 12 L15 18"
                                fill="none"
                                stroke="url(#chevron-gradient-left)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        {/* Right Chevron */}
                        <svg
                            viewBox="0 0 24 24"
                            className="chevron-right"
                            style={{
                                opacity: phase >= 2 ? 0 : 1,
                                transform: phase >= 1
                                    ? 'translateX(50px) scale(1.15)'
                                    : 'translateX(22px)',
                            }}
                        >
                            <defs>
                                <linearGradient id="chevron-gradient-right" x1="0" x2="1" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#ffffff" />
                                    <stop offset="100%" stopColor="#e0f7ff" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M9 6 L16 12 L9 18"
                                fill="none"
                                stroke="url(#chevron-gradient-right)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Brand Name - with fade in animation */}
            <div
                className="brand-container"
                style={{
                    opacity: phase >= 3 ? 1 : 0,
                    transform: phase >= 3 ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                    animation: phase >= 3 ? 'float 3s ease-in-out infinite, glow-pulse 2s ease-in-out infinite' : 'none',
                }}
            >
                <h1 className="brand-title">
                    <span className="brand-algo">Algo</span>
                    <span className="brand-viz">Viz</span>
                </h1>

                {/* Tagline */}
                <p className="tagline">
                    Visualize • Learn • Master
                </p>
            </div>

            {/* Status Text */}
            <div className="status-text">
                <span>Initializing</span>
                <span className="cursor-blink">_</span>
            </div>
        </div>
    );
};

export default InitialLoader;
