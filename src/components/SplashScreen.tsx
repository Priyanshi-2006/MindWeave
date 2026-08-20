import { useEffect, useState } from "react";
import logoImg from "@/assets/logo.png";
import foxImg from "@/assets/char-fox.png";
import catImg from "@/assets/char-cat.png";
import monkeyImg from "@/assets/char-monkey.png";
import breadImg from "@/assets/char-bread.png";

interface SplashScreenProps {
  /** Optional callback when splash screen finishes exiting */
  onFinish?: () => void;
  /** Display duration in ms before starting fade out (default: 2300ms) */
  duration?: number;
}

export function SplashScreen({ onFinish, duration = 2300 }: SplashScreenProps) {
  const [mounted, setMounted] = useState(true);
  const [isPeeking, setIsPeeking] = useState(false);
  const [isLogoVisible, setIsLogoVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Phase 1 -> Phase 2: Characters peek into screen with staggered timing
    const peekTimer = setTimeout(() => {
      setIsPeeking(true);
    }, 150);

    // Phase 2 -> Phase 3: MindWeave logo reveals smoothly in center
    const logoTimer = setTimeout(() => {
      setIsLogoVisible(true);
    }, 650);

    // Phase 4 -> Phase 5: Exit (characters retreat, logo & container fade out)
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration);

    // Complete exit and unmount component after transition (600ms)
    const unmountTimer = setTimeout(() => {
      setMounted(false);
      onFinish?.();
    }, duration + 600);

    return () => {
      clearTimeout(peekTimer);
      clearTimeout(logoTimer);
      clearTimeout(exitTimer);
      clearTimeout(unmountTimer);
    };
  }, [duration, onFinish]);

  if (!mounted) return null;

  const isCharactersVisible = isPeeking && !isExiting;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background select-none transition-opacity duration-600 ease-out ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={isExiting}
      role="dialog"
      aria-label="MindWeave Splash Screen"
    >
      {/* Ambient subtle background glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.62_0.19_300/0.08),transparent_70%)]"
        aria-hidden="true"
      />

      {/* Top-Left Character: Fox */}
      <div
        className="pointer-events-none absolute top-0 left-0 transition-transform duration-700 ease-out"
        style={{
          transitionDelay: isExiting ? "0ms" : "80ms",
          transform: isCharactersVisible
            ? "translate(-18%, -18%) rotate(18deg)"
            : "translate(-85%, -85%) rotate(18deg)",
        }}
      >
        <img
          src={foxImg}
          alt=""
          className="h-auto w-28 sm:w-36 md:w-44 lg:w-52 object-contain drop-shadow-md"
          loading="eager"
        />
      </div>

      {/* Top-Right Character: Cat */}
      <div
        className="pointer-events-none absolute top-0 right-0 transition-transform duration-700 ease-out"
        style={{
          transitionDelay: isExiting ? "0ms" : "220ms",
          transform: isCharactersVisible
            ? "translate(18%, -18%) rotate(-18deg)"
            : "translate(85%, -85%) rotate(-18deg)",
        }}
      >
        <img
          src={catImg}
          alt=""
          className="h-auto w-28 sm:w-36 md:w-44 lg:w-52 object-contain drop-shadow-md"
          loading="eager"
        />
      </div>

      {/* Bottom-Left Character: Monkey */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 transition-transform duration-700 ease-out"
        style={{
          transitionDelay: isExiting ? "0ms" : "150ms",
          transform: isCharactersVisible
            ? "translate(-18%, 18%) rotate(-15deg)"
            : "translate(-85%, 85%) rotate(-15deg)",
        }}
      >
        <img
          src={monkeyImg}
          alt=""
          className="h-auto w-28 sm:w-36 md:w-44 lg:w-52 object-contain drop-shadow-md"
          loading="eager"
        />
      </div>

      {/* Bottom-Right Character: Toast / Bread */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 transition-transform duration-700 ease-out"
        style={{
          transitionDelay: isExiting ? "0ms" : "280ms",
          transform: isCharactersVisible
            ? "translate(18%, 18%) rotate(15deg)"
            : "translate(85%, 85%) rotate(15deg)",
        }}
      >
        <img
          src={breadImg}
          alt=""
          className="h-auto w-28 sm:w-36 md:w-44 lg:w-52 object-contain drop-shadow-md"
          loading="eager"
        />
      </div>

      {/* Center: MindWeave Logo */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center transition-all duration-700 ease-out transform ${
          isLogoVisible && !isExiting
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95"
        }`}
      >
        <img
          src={logoImg}
          alt="MindWeave"
          className="h-auto w-64 max-w-[75vw] object-contain drop-shadow-sm sm:w-80 md:w-96 lg:w-[28rem]"
          width={448}
          height={252}
          loading="eager"
        />
      </div>
    </div>
  );
}
