"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { MESSAGES, PERSONAL } from "@/lib/messages";

type Phase = "form" | "envelope" | "letter";
type EnvState = "descending" | "idle" | "open" | "gone";
type Star = { left: number; top: number; delay: string };
type Bat = { top: number; duration: number; delay: number; scale: number };
type Spark = { id: number; icon: string; left: number; dx: number; r: number; delay: number };

const SPARK_ICONS = ["🍬", "🎃", "✨", "🦇", "🍭", "👻"];
const BAT_PATH =
  "M32 12c-2-4-5-5-5-5s0 3 1 5c-6-6-18-9-28-4 6 1 9 5 9 9 3-3 7-3 9 0 2-3 6-3 9 1 1-2 3-3 5-3s4 1 5 3c3-4 7-4 9-1 2-3 6-3 9 0 0-4 3-8 9-9-10-5-22-2-28 4 1-2 1-5 1-5s-3 1-5 5z";

const toTitle = (s: string) => s.trim().replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function SugarCubes() {
  const [name, setName] = useState("");
  const [who, setWho] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [envState, setEnvState] = useState<EnvState>("descending");
  const [envKey, setEnvKey] = useState(0);
  const [letterKey, setLetterKey] = useState(0);
  const [current, setCurrent] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [toast, setToast] = useState("");
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [bats, setBats] = useState<Bat[]>([]);
  const [reduced, setReduced] = useState(false);

  const lastIdx = useRef(-1);
  const sparkId = useRef(0);
  const timers = useRef<number[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Random sky is generated on the client only, so server and client markup match.
  useEffect(() => {
    setStars(
      Array.from({ length: 60 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 65,
        delay: (Math.random() * 3).toFixed(2),
      }))
    );
    setBats(
      Array.from({ length: 6 }, () => ({
        top: 8 + Math.random() * 40,
        duration: 14 + Math.random() * 12,
        delay: Math.random() * 20,
        scale: 0.6 + Math.random() * 0.7,
      }))
    );
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      clearTimers();
    };
  }, []);

  const pick = (person: string) => {
    const p = PERSONAL[person.toLowerCase()];
    if (p && lastIdx.current !== -2) {
      lastIdx.current = -2;
      return p;
    }
    let i: number;
    do {
      i = Math.floor(Math.random() * MESSAGES.length);
    } while (MESSAGES.length > 1 && i === lastIdx.current);
    lastIdx.current = i;
    return MESSAGES[i].replaceAll("{name}", person);
  };

  const burst = () => {
    if (reduced) return;
    const batch: Spark[] = Array.from({ length: 22 }, (_, i) => ({
      id: sparkId.current++,
      icon: SPARK_ICONS[i % SPARK_ICONS.length],
      left: 40 + Math.random() * 20,
      dx: Math.random() * 80 - 40,
      r: Math.random() * 720 - 360,
      delay: Math.random() * 0.4,
    }));
    const ids = new Set(batch.map((s) => s.id));
    setSparks((prev) => [...prev, ...batch]);
    window.setTimeout(() => setSparks((prev) => prev.filter((s) => !ids.has(s.id))), 2400);
  };

  const deliver = () => {
    clearTimers();
    setShowActions(false);
    setToast("");
    setPhase("envelope");
    setEnvState("descending");
    setEnvKey((k) => k + 1); // remount restarts the descend animation
    later(() => setEnvState("idle"), reduced ? 0 : 2200);
  };

  const openLetter = () => {
    clearTimers();
    setEnvState("open");
    setCurrent(pick(who));
    later(() => {
      setEnvState("gone");
      later(() => {
        setPhase("letter");
        setLetterKey((k) => k + 1);
        burst();
        later(() => setShowActions(true), reduced ? 0 : 900);
      }, reduced ? 0 : 450);
    }, reduced ? 0 : 1700);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const person = toTitle(name);
    if (!person) return;
    setWho(person);
    lastIdx.current = -1;
    deliver();
  };

  const reset = () => {
    clearTimers();
    setPhase("form");
    setShowActions(false);
    setToast("");
    setName("");
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const copy = async () => {
    const text = `Dear ${who},\n\n${current}\n\nWith love,\nExecutive Board 26.27, AIESEC in University of Moratuwa`;
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied. Spread the sweetness!");
    } catch {
      setToast("Copy is blocked here. A screenshot works too!");
    }
  };

  const envClass =
    "env" +
    (envState === "idle" ? " idle" : "") +
    (envState === "open" || envState === "gone" ? " open" : "") +
    (envState === "gone" ? " gone" : "");

  return (
    <>
      <div className="sky" aria-hidden="true">
        <div className="moon" />
        <div>
          {stars.map((s, i) => (
            <i key={i} className="star" style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }} />
          ))}
        </div>
        <div>
          {bats.map((b, i) => (
            <div
              key={i}
              className="bat"
              style={{
                top: `${b.top}%`,
                animationDuration: `${b.duration}s`,
                animationDelay: `-${b.delay}s`,
                transform: `scale(${b.scale})`,
              }}
            >
              <svg viewBox="0 0 64 32">
                <path d={BAT_PATH} />
              </svg>
            </div>
          ))}
        </div>
        <div className="fog" />
        <svg className="skyline" viewBox="0 0 1200 240" preserveAspectRatio="xMidYMax slice">
          <path
            fill="#0b0810"
            d="M0 240V170h40v-20h30v20h50l20-40 20 40h40v-60l35-45 35 45v40h20v-90l10-20 10 20v90h40v30h60l15-25 15 25h60v-50h20l40-60 40 60h20v-30l25-30 25 30v80h40l30-50 30 50h50v-40h30v-25l20-30 20 30v65h60l40-40 40 40h50v-30h30v30h70v70z"
          />
          <g fill="#ffb057" opacity=".85">
            <rect x="336" y="135" width="10" height="14" />
            <rect x="580" y="160" width="10" height="12" />
            <rect x="612" y="160" width="10" height="12" />
            <rect x="852" y="185" width="9" height="12" />
            <rect x="1080" y="190" width="10" height="12" />
          </g>
          <g transform="translate(150 205)">
            <ellipse rx="26" ry="20" fill="#ff7a1a" />
            <path d="M-3-20q2-10 9-12" stroke="#3a5a1a" strokeWidth="4" fill="none" />
            <path fill="#2b1003" d="M-14-4l6-6 4 6zM4-4l6-6 4 6zM-12 6q12 10 24 0l-4 4-4-3-4 3-4-3-4 3z" />
          </g>
          <g transform="translate(1000 214) scale(.7)">
            <ellipse rx="26" ry="20" fill="#ff7a1a" />
            <path fill="#2b1003" d="M-14-4l6-6 4 6zM4-4l6-6 4 6zM-12 6q12 10 24 0z" />
          </g>
        </svg>
      </div>

      <main>
        <p className="kicker">AIESEC in University of Moratuwa · Halloween LCM</p>
        <h1>Sugar Cubes from the Crypt</h1>
        <p className="sub">
          The Executive Board 26.27 has sealed a little <span className="cube" /> sugar cube just for you. Tell us who
          you are and the bats will deliver it.
        </p>

        <section className="stage">
          {phase === "form" && (
            <form onSubmit={onSubmit} autoComplete="off">
              <label htmlFor="name">Your name, brave delegate</label>
              <input
                ref={nameRef}
                id="name"
                name="name"
                maxLength={40}
                placeholder="e.g. Nethmi"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button className="go" type="submit">
                Summon my sugar cube
              </button>
              <p className="hint">No tricks. Only treats.</p>
            </form>
          )}

          <div className={`envwrap${phase === "envelope" ? " on" : ""}`} aria-live="polite">
            {phase === "envelope" && (
              <>
                <div className={envClass} key={envKey}>
                  <div className="back" />
                  <div className="peek" />
                  <div className="front" />
                  <div className="flap" />
                  <button className="seal" aria-label="Break the wax seal" onClick={openLetter}>
                    EB<span>26.27</span>
                  </button>
                </div>
                {envState !== "open" && envState !== "gone" && (
                  <p className="tap">A letter has landed. Tap the wax seal to break it.</p>
                )}
              </>
            )}
          </div>

          {phase === "letter" && (
            <article className="letter on" key={letterKey} aria-live="polite">
              <svg className="corner" viewBox="0 0 40 40" aria-hidden="true">
                <path
                  fill="#2a1d14"
                  d="M20 26c-4-6-12-6-16-2 2-6 8-9 12-7-2-3-1-6 1-8 0 3 2 5 3 6 1-1 3-3 3-6 2 2 3 5 1 8 4-2 10 1 12 7-4-4-12-4-16 2z"
                />
              </svg>
              <p className="to">Dear {who},</p>
              <p className="msg">
                {reduced
                  ? current
                  : current.split("").map((ch, i) => (
                      <span key={i} className="c" style={{ animationDelay: `${i * 22}ms` }}>
                        {ch}
                      </span>
                    ))}
              </p>
              <p className="sign">
                With love from the haunted manor,<b>Executive Board 26.27</b>AIESEC in University of Moratuwa
              </p>
            </article>
          )}

          {showActions && (
            <div className="actions">
              <button className="go" onClick={deliver}>
                Another sugar cube
              </button>
              <button className="ghost" onClick={copy}>
                Copy message
              </button>
              <button className="ghost" onClick={reset}>
                New delegate
              </button>
            </div>
          )}
          <p className="toast" role="status">
            {toast}
          </p>
        </section>
      </main>
      <footer>Happy Halloween from EB 26.27</footer>

      {sparks.map((s) => (
        <span
          key={s.id}
          className="spark"
          style={
            {
              left: `${s.left}vw`,
              top: "60vh",
              animationDelay: `${s.delay}s`,
              "--dx": `${s.dx}vw`,
              "--r": `${s.r}deg`,
            } as CSSProperties
          }
        >
          {s.icon}
        </span>
      ))}
    </>
  );
}
