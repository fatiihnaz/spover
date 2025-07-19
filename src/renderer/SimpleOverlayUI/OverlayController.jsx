import { motion } from "framer-motion";
import { SkipBack, Play, Pause, SkipForward, Volume2 } from "lucide-react";
import { useCallback, useState } from "react";

const clamp = (min, val, max) => Math.min(Math.max(val, min), max);

export default function OverlayController({ onAction, isPlaying, volume = 75, VIS = 1 }) {
  const [activeBtn, setActiveBtn] = useState(null); // hangi buton aktif
  
  /* sizes scaled with VIS */
  const BTN = clamp(20, 32 * VIS, 48);
  const ICON = clamp(12, 16 * VIS, 24);
  const SLIDER_W = clamp(72, 100 * VIS, 160);
  const THUMB = clamp(3, 4 * VIS, 6); // Minimal thumb boyutu
  const GAP_Y = 6 * VIS;

  const click = useCallback(type => async () => {
    setActiveBtn(type); // Butonu aktif göster
    await onAction(type);
    // Kısa bir süre sonra aktif durumu kaldır
    setTimeout(() => setActiveBtn(null), 200);
  }, [onAction]);
  
  const changeV = useCallback(e => onAction("vol", +e.target.value), [onAction]);

  // Container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  // Border variants
  const borderVariants = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  };

  // Bar variants
  const barVariants = {
    hidden: { opacity: 0, y: -GAP_Y },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  };

  /* -------------------------------------------------------------------- */
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={containerVariants}
      className="flex flex-col w-full items-center mt-2 pointer-events-auto select-none"
      style={{ maxWidth: SLIDER_W + BTN * 4 + 32 }}
    >
      {/* top splitting border */}
      <div className="relative w-full h-0.5 overflow-visible mb-1">
        {/* left wing */}
        <motion.div
          className="absolute right-1/2 top-0 h-full bg-white/15"
          style={{ width: "50%", transformOrigin: "right" }}
          variants={borderVariants}
        />
        {/* right wing */}
        <motion.div
          className="absolute left-1/2 top-0 h-full bg-white/15"
          style={{ width: "50%", transformOrigin: "left" }}
          variants={borderVariants}
        />
      </div>

      {/* control bar */}
      <motion.div
        className="flex items-center gap-1 pt-1"
        variants={barVariants}
      >
        <IconBtn 
          size={BTN} 
          icon={SkipBack} 
          iconSize={ICON} 
          label="Önceki" 
          onClick={click("prev")}
          active={activeBtn === "prev"}
        />
        <IconBtn 
          size={BTN} 
          icon={isPlaying ? Pause : Play} 
          iconSize={ICON} 
          accent={isPlaying} 
          label={isPlaying ? "Duraklat" : "Oynat"} 
          onClick={click("play")}
          active={activeBtn === "play"}
        />
        <IconBtn 
          size={BTN} 
          icon={SkipForward} 
          iconSize={ICON} 
          label="Sonraki" 
          onClick={click("next")}
          active={activeBtn === "next"}
        />

        <div className="flex items-center gap-1 pl-1">
          <Volume2 style={{ width: ICON, height: ICON }} className="text-white/80" />
          <input
            type="range"
            min={0}
            max={100}
            value={volume ?? 0}
            onChange={changeV}
            style={{ width: SLIDER_W, '--thumb-size': `${THUMB}px` }}
            className={`volume-slider h-1 accent-emerald-500 cursor-pointer ${volume === null ? 'opacity-40 pointer-events-none' : ''}`}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------------------------------------------- */
function IconBtn({ icon: Icon, label, onClick, accent = false, active = false, size = 32, iconSize = 16 }) {
  return (
    <motion.button
      title={label}
      onClick={onClick}
      style={{ width: size, height: size }}
      whileTap={{ scale: 0.95 }}
      animate={{ 
        scale: active ? 0.95 : 1,
        backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent'
      }}
      transition={{ duration: 0.1 }}
      className={`grid place-items-center rounded-md transition-colors
                  hover:bg-white/10 ${accent ? "text-emerald-500 shadow-md" : "text-white/80"}`}>
      <Icon style={{ width: iconSize, height: iconSize }} />
    </motion.button>
  );
}
