import { useState, useRef, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useAnimationControls,
  type PanInfo,
} from "framer-motion";
import "./LanyardCard.css";

// --- SVG coordinate system ---
// The SVG is 400x600, centered. Anchor (strap bottom) is at (200, 60).
// Card rests at CSS top:220px, which maps to SVG y≈230 for the clip top.
const SVG_W = 400;
const SVG_H = 600;
const ANCHOR_X = SVG_W / 2; // 200
const ANCHOR_Y = 60;
const CARD_REST_Y = 230; // where rope meets clip at rest

export default function LanyardCard() {
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ropeRef = useRef<SVGPathElement>(null);
  const ropeTextureRef = useRef<SVGPathElement>(null);
  const ropeShineRef = useRef<SVGPathElement>(null);
  const strapRef = useRef<SVGPathElement>(null);
  const strapHighlightRef = useRef<SVGPathElement>(null);
  const clipGroupRef = useRef<SVGGElement>(null);
  const rafRef = useRef<number>(0);
  const controls = useAnimationControls();

  // --- Motion values for drag ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // --- Rotation follows horizontal drag ---
  const rawRotate = useTransform(x, [-300, 0, 300], [-35, 0, 35]);
  const rotate = useSpring(rawRotate, { stiffness: 180, damping: 18 });

  // --- Rope update: direct DOM mutation via ref (no React state = no lag) ---
  const updateRope = useCallback(() => {
    const cx = x.get();
    const cy = y.get();

    // Card clip top position in SVG coords
    const tipX = ANCHOR_X + cx;
    const tipY = CARD_REST_Y + cy;

    // Rope length & sag
    const dx = tipX - ANCHOR_X;
    const dy = tipY - ANCHOR_Y;
    const dist = Math.hypot(dx, dy);

    // Sag increases with distance + gravity always pulls down
    const sagBase = 25;
    const sagDynamic = dist * 0.18;
    const totalSag = sagBase + sagDynamic;

    // Control point: midpoint shifted down by sag, slightly toward pull direction
    const midX = (ANCHOR_X + tipX) / 2 + dx * 0.08;
    const midY = (ANCHOR_Y + tipY) / 2 + totalSag;

    // Quadratic bezier rope
    const ropeD = `M ${ANCHOR_X},${ANCHOR_Y} Q ${midX},${midY} ${tipX},${tipY}`;

    // Update all three rope layers (base, texture, shine)
    if (ropeRef.current) ropeRef.current.setAttribute("d", ropeD);
    if (ropeTextureRef.current) ropeTextureRef.current.setAttribute("d", ropeD);
    if (ropeShineRef.current) ropeShineRef.current.setAttribute("d", ropeD);

    // Move metal clip to rope endpoint
    if (clipGroupRef.current) {
      clipGroupRef.current.setAttribute(
        "transform",
        `translate(${tipX - ANCHOR_X}, ${tipY - CARD_REST_Y})`
      );
    }

    // Strap loop shifts subtly with horizontal pull
    const pull = Math.max(-1, Math.min(1, cx / 150));
    const s = pull * 15;
    const strapD = `M ${140 + s * 0.2},0 Q ${140 + s * 0.6},45 ${200 + s},${ANCHOR_Y} Q ${260 + s * 0.6},45 ${260 + s * 0.2},0`;

    if (strapRef.current) strapRef.current.setAttribute("d", strapD);
    if (strapHighlightRef.current) strapHighlightRef.current.setAttribute("d", strapD);
  }, [x, y]);

  // --- Subscribe to raw motion values for instant rope tracking ---
  useEffect(() => {
    const unsubX = x.on("change", () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateRope);
    });
    const unsubY = y.on("change", () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateRope);
    });

    // Initial draw
    updateRope();

    return () => {
      unsubX();
      unsubY();
      cancelAnimationFrame(rafRef.current);
    };
  }, [x, y, updateRope]);

  // --- Idle swing ---
  useEffect(() => {
    if (hasInteracted) return;
    let cancelled = false;
    const runIdle = async () => {
      await new Promise((r) => setTimeout(r, 1200));
      while (!cancelled) {
        await controls.start({ x: 15, transition: { duration: 2.5, ease: "easeInOut" } });
        if (cancelled) break;
        await controls.start({ x: -12, transition: { duration: 2.5, ease: "easeInOut" } });
        if (cancelled) break;
        await controls.start({ x: 0, transition: { duration: 2, ease: "easeInOut" } });
      }
    };
    runIdle();
    return () => { cancelled = true; };
  }, [hasInteracted, controls]);

  // --- Handlers ---
  const handleDragStart = () => {
    setIsDragging(true);
    if (!hasInteracted) {
      setHasInteracted(true);
      controls.stop();
    }
  };

  const handleDrag = (_: unknown, _info: PanInfo) => {
    // x/y motion values auto-updated by framer-motion drag
    // rope follows via the subscription above
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setIsDragging(false);
    const speed = Math.hypot(info.velocity.x, info.velocity.y);

    controls.start({
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 60 + Math.min(speed * 0.02, 40),
        damping: 6,
        mass: 0.9,
        restDelta: 0.5,
      },
    });
  };

  return (
    <div className="lanyard-system" ref={containerRef}>
      {/* SVG Rope — large viewBox, overflow visible */}
      <svg
        className="lanyard-rope"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMin meet"
      >
        <defs>
          {/* Braided rope texture pattern */}
          <pattern
            id="ropePattern"
            patternUnits="userSpaceOnUse"
            width="6"
            height="8"
            patternTransform="rotate(15)"
          >
            <rect width="6" height="8" fill="#2a2a2a" />
            <path
              d="M 0,0 Q 3,2 6,0 M 0,4 Q 3,6 6,4 M 0,8 Q 3,10 6,8"
              stroke="#3a3a3a"
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M 0,2 Q 3,4 6,2 M 0,6 Q 3,8 6,6"
              stroke="#1e1e1e"
              strokeWidth="0.8"
              fill="none"
            />
          </pattern>

          {/* Rope edge shadow for 3D feel */}
          <linearGradient id="ropeEdgeL" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#111" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#333" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ropeEdgeR" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#111" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#333" stopOpacity="0" />
          </linearGradient>

          {/* Strap gradient — dark woven look */}
          <linearGradient id="strapGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#222" />
            <stop offset="50%" stopColor="#2d2d2d" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </linearGradient>

          {/* Metal clip gradient */}
          <linearGradient id="metalClip" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e0e0e0" />
            <stop offset="30%" stopColor="#a8a8a8" />
            <stop offset="60%" stopColor="#c5c5c5" />
            <stop offset="100%" stopColor="#888" />
          </linearGradient>

          {/* Subtle rope shadow filter */}
          <filter id="ropeShadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
          </filter>
          <filter id="strapShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
          </filter>
          <filter id="clipShadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0.5" dy="1.5" stdDeviation="1.5" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Strap loop (neck piece) — thick dark woven band */}
        {/* Shadow layer */}
        <path
          ref={strapRef}
          className="strap-loop"
          d={`M 140,0 Q 140,45 ${ANCHOR_X},${ANCHOR_Y} Q 260,45 260,0`}
          fill="none"
          stroke="url(#strapGrad)"
          strokeWidth="11"
          strokeLinecap="round"
          filter="url(#strapShadow)"
        />
        {/* Highlight thread on strap */}
        <path
          ref={strapHighlightRef}
          className="strap-highlight"
          d={`M 140,0 Q 140,45 ${ANCHOR_X},${ANCHOR_Y} Q 260,45 260,0`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="2 4"
        />

        {/* Rope from strap to clip — main thick dark cord */}
        <path
          ref={ropeRef}
          className="rope-path"
          d={`M ${ANCHOR_X},${ANCHOR_Y} L ${ANCHOR_X},${CARD_REST_Y}`}
          fill="none"
          stroke="#222"
          strokeWidth="8"
          strokeLinecap="round"
          filter="url(#ropeShadow)"
        />
        {/* Rope braid texture overlay */}
        <path
          ref={ropeTextureRef}
          className="rope-texture"
          d={`M ${ANCHOR_X},${ANCHOR_Y} L ${ANCHOR_X},${CARD_REST_Y}`}
          fill="none"
          stroke="url(#ropePattern)"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Rope highlight — subtle shine for 3D */}
        <path
          ref={ropeShineRef}
          className="rope-shine"
          d={`M ${ANCHOR_X},${ANCHOR_Y} L ${ANCHOR_X},${CARD_REST_Y}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Metal swivel clip at rope bottom */}
        <g ref={clipGroupRef} className="metal-clip-svg" filter="url(#clipShadow)">
          {/* Clip ring */}
          <ellipse
            cx={ANCHOR_X}
            cy={CARD_REST_Y - 8}
            rx="6"
            ry="7"
            fill="none"
            stroke="url(#metalClip)"
            strokeWidth="3"
          />
          {/* Clip body */}
          <rect
            x={ANCHOR_X - 5}
            y={CARD_REST_Y - 2}
            width="10"
            height="16"
            rx="2"
            fill="url(#metalClip)"
            stroke="#777"
            strokeWidth="0.5"
          />
          {/* Clip clasp line */}
          <line
            x1={ANCHOR_X - 3}
            y1={CARD_REST_Y + 4}
            x2={ANCHOR_X + 3}
            y2={CARD_REST_Y + 4}
            stroke="#888"
            strokeWidth="1"
          />
          <line
            x1={ANCHOR_X}
            y1={CARD_REST_Y + 1}
            x2={ANCHOR_X}
            y2={CARD_REST_Y + 7}
            stroke="#999"
            strokeWidth="0.8"
          />
        </g>
      </svg>

      {/* Draggable ID Card */}
      <motion.div
        className={`id-card ${isDragging ? "dragging" : ""}`}
        style={{ x, y, rotate }}
        animate={controls}
        drag
        dragConstraints={false}
        dragElastic={0.6}
        dragMomentum={true}
        dragTransition={{
          bounceStiffness: 100,
          bounceDamping: 10,
          power: 0.6,
          timeConstant: 350,
        }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.06 }}
      >
        <div className="id-card-clip">
          <div className="clip-hole" />
        </div>
        <div className="id-card-body">
          <div className="id-card-photo">
            <img
              src="/foto-musa.png"
              alt="Musa Habibulloh Al Faruq"
              draggable={false}
            />
          </div>
        </div>

        {/* Drag hint */}
        <motion.div
          className="drag-hint"
          animate={{ opacity: hasInteracted ? 0 : [0.4, 1, 0.4] }}
          transition={
            hasInteracted
              ? { duration: 0.3 }
              : { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <span className="hint-icon">👆</span> drag me
        </motion.div>
      </motion.div>
    </div>
  );
}
