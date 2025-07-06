import { motion } from "framer-motion";
import { SkipBack, Play, Pause, SkipForward, Volume2 } from "lucide-react";
import { useCallback } from "react";

const clamp = (min, val, max) => Math.min(Math.max(val, min), max);

export default function OverlayController({ onAction, isPlaying, volume = 75, VIS = 1 }) {
  /* sizes scaled with VIS */
  const BTN = clamp(20, 32 * VIS, 48);
  const ICON = clamp(12, 16 * VIS, 24);
  const SLIDER_W = clamp(72, 100 * VIS, 160);
  const THUMB = clamp(8, 12 * VIS, 20);
  const GAP_Y = 6 * VIS;

  const click = useCallback(type => () => onAction(type), [onAction]);
  const changeV = useCallback(e => onAction("vol", +e.target.value), [onAction]);

  /* Variants ------------------------------------------------------------ */
  const borderVariant = {
    closed: i => ({
      scaleX: 0,
      transition: { duration: 0.2, delay: 0.25 }, // wait on exit
    }),
    open: i => ({
      scaleX: 1,
      transition: { duration: 0.25, delay: i * 0.0 },
    }),
  };

  const barVariant = {
    closed: { opacity: 0, y: -GAP_Y, transition: { duration: 0.2 } },
    open: { opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.25 } },
  };

  /* -------------------------------------------------------------------- */
  return (
    <motion.div
      initial="closed"
      animate="open"
      exit="closed"
      className="flex flex-col w-full items-center mt-2 pointer-events-auto select-none"
      style={{ maxWidth: SLIDER_W + BTN * 4 + 32 }}
    >
      {/* top splitting border */}
      <div className="relative w-full h-0.25 overflow-visible">
        {/* left wing */}
        <motion.div
          className="absolute right-1/2 top-0 h-full bg-white/10"
          style={{ width: "60%", transformOrigin: "right" }}
          variants={borderVariant}
          custom={0}
        />
        {/* right wing */}
        <motion.div
          className="absolute left-1/2 top-0 h-full bg-white/10"
          style={{ width: "60%", transformOrigin: "left" }}
          variants={borderVariant}
          custom={0}
        />
      </div>

      {/* control bar */}
      <motion.div
        className="flex items-center gap-1 pt-1"
        variants={barVariant}
      >
        <IconBtn size={BTN} icon={SkipBack} iconSize={ICON} label="Önceki" onClick={click("prev")} />
        <IconBtn size={BTN} icon={isPlaying ? Pause : Play} iconSize={ICON} accent={isPlaying} label={isPlaying ? "Duraklat" : "Oynat"} onClick={click("play")} />
        <IconBtn size={BTN} icon={SkipForward} iconSize={ICON} label="Sonraki" onClick={click("next")} />

        <div className="flex items-center gap-1 pl-1">
          <Volume2 style={{ width: ICON, height: ICON }} className="text-white/80" />
          <input
            type="range"
            min={0}
            max={100}
            value={volume ?? 0}
            onChange={changeV}
            style={{ width: SLIDER_W, '--thumb-size': THUMB }}
            className={`h-1 accent-emerald-500 cursor-pointer ${volume === null ? 'opacity-40 pointer-events-none' : ''}`}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------------------------------------------- */
function IconBtn({ icon: Icon, label, onClick, accent = false, size = 32, iconSize = 16 }) {
  return (
    <button
      title={label}
      onClick={onClick}
      style={{ width: size, height: size }}
      className={`grid place-items-center rounded-full transition
                  hover:bg-white/10 ${accent ? "bg-emerald-500 text-white shadow-md" : "text-white/80"}`}>
      <Icon style={{ width: iconSize, height: iconSize }} />
    </button>
  );
}
