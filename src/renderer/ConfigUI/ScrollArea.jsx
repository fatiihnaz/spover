import { useEffect, useRef } from 'react';

/**
 * ------------------------------------------------
 * • Yerleşik scrollbar gizli                                   (scrollbar-hide)
 * • Track-ince (≈6 px) – 4 px iç tampon; üst & alta tam oturur
 * • Thumb boyu min 24 px, max track’in %80’i
 * • Kaydırma dura­ınca 0.8 s sonra hem track hem thumb solar
 */
export default function ScrollArea({ children, className = '' }) {
  /* -------- refs ------------------------------------------------------- */
  const containerRef = useRef(null);   // overflow:hidden  – scrollbar gizli
  const contentRef   = useRef(null);   // overflow:auto    – gerçek scroll
  const trackRef     = useRef(null);   // görsel track
  const thumbRef     = useRef(null);   // yeşil thumb

  /* -------- yardımcılar ------------------------------------------------ */
  /** Thumb yüksekliğini ve konumunu güncelle */
  const updateThumb = () => {
    const content = contentRef.current;
    const thumb   = thumbRef.current;
    const track   = trackRef.current;
    if (!content || !thumb || !track) return;

    const { clientHeight, scrollHeight, scrollTop } = content;
    const trackHeight = track.offsetHeight;

    // Scroll gerekmiyorsa scrollbar’ı tamamen gizle
    if (scrollHeight <= clientHeight + 2) {
      track.style.opacity = 0;
      thumb.style.opacity = 0;
      return;
    }

    // Track/Thumb görünür
    track.style.opacity = 0.4;
    thumb.style.opacity = 1;

    // Thumb yüksekliği (min 24 px, max track*0.8)
    const rawH   = (clientHeight / scrollHeight) * trackHeight;
    const height = Math.max(24, Math.min(rawH, trackHeight * 0.8));
    thumb.style.height = `${height}px`;

    // Thumb konumu
    const maxScroll   = scrollHeight - clientHeight;
    const maxThumbTop = trackHeight - height;
    const top = (scrollTop / maxScroll) * maxThumbTop;
    thumb.style.top = `${top}px`;
  };

  /** Kaydırma durunca 800 ms’de solma – debounced */
  let fadeT;
  const handleScroll = () => {
    clearTimeout(fadeT);
    updateThumb();
    fadeT = setTimeout(() => {
      trackRef.current.style.opacity = 0;
      thumbRef.current.style.opacity = 0;
    }, 800);
  };

  /* -------- lifecycle -------------------------------------------------- */
  useEffect(() => {
    updateThumb();                              // ilk render
    const content = contentRef.current;
    window.addEventListener('resize', updateThumb);
    content.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', updateThumb);
      content.removeEventListener('scroll', handleScroll);
      clearTimeout(fadeT);
    };
  }, []);

  /* -------- render ----------------------------------------------------- */
  return (
    <div                                  /* Kapsayıcı */
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Gerçek kaydırılan içerik */}
      <div
        ref={contentRef}
        className="h-full overflow-auto scrollbar-hide -mr-4 pr-4" /* -mr → yerleşik scrollbar dışarı taşar, görünmez */
      >
        {children}
      </div>

      {/* Track + Thumb */}
      <div
        ref={trackRef}
        className="pointer-events-none absolute inset-y-1 right-1 w-1.5 rounded-full 
                   bg-white/10 opacity-0 transition-opacity duration-300 my-10"
      >
        <div
          ref={thumbRef}
          className="absolute left-0 right-0 top-0 rounded-full bg-zinc-500/80
                     opacity-0 transition-opacity duration-300"
        />
      </div>
    </div>
  );
}
