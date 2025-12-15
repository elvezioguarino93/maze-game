"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { canMove, type Dir, type Maze, type Pos, generateLevel, type LevelMode } from "@/lib/maze";

function levelToSize(level: number) {
  const size = Math.min(20, 9 + (level - 1) * 2);
  return { w: size, h: size };
}

/** ---- i18n ---- */
type Lang = "en" | "it" | "es" | "fr" | "de" | "pt" | "ro";

const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  it: "Italiano",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ro: "Română",
};

type I18n = {
  title: string;
  level: string;
  unlocked: string;
  fog: string;
  addedDifficulty: string;
  reset: string;
  loading: string;
  levels: string;
  hintKeys: string;

  keyStatus: string;
  keyTaken: string;
  keyMissing: string;

  sequence: string;
  goToA: string;
  goToB: string;
  goToExit: string;

  addedOnlyFog: string;
  addedFarEndpoints: string;
  addedNearButFar: string;
  addedKey: string;
  addedSequence: string;

  exitLocked: string;
  exitUnlocked: string;

  language: string;

  enableSound: string;
  soundOn: string;
  soundOff: string;

  continueSaved: string;
};

const I18N: Record<Lang, I18n> = {
  en: {
    title: "Maze Game",
    level: "Level",
    unlocked: "Unlocked",
    fog: "Fog",
    addedDifficulty: "Difficulty added in this level",
    reset: "Reset",
    loading: "Loading…",
    levels: "Levels",
    hintKeys: "J back • L forward • R regenerate",

    keyStatus: "Key status",
    keyTaken: "TAKEN ✅",
    keyMissing: "MISSING ❌",

    sequence: "Sequence",
    goToA: "Go to A",
    goToB: "Go to B",
    goToExit: "OK ✅ go to Exit",

    addedOnlyFog: "Fog only (base)",
    addedFarEndpoints: "Start/Exit far apart",
    addedNearButFar: "Exit looks close but path is long",
    addedKey: "Single key (Exit locked until you pick it up)",
    addedSequence: "Sequence A → B → Exit (Exit locked until completed)",

    exitLocked: "LOCKED",
    exitUnlocked: "UNLOCKED",

    language: "Language",

    enableSound: "Enable sound",
    soundOn: "Sound: ON",
    soundOff: "Sound: OFF",

    continueSaved: "Continuing from saved progress",
  },

  it: {
    title: "Maze Game",
    level: "Livello",
    unlocked: "Sbloccati",
    fog: "Nebbia",
    addedDifficulty: "Difficoltà aggiunta in questo livello",
    reset: "Reset",
    loading: "Caricamento…",
    levels: "Livelli",
    hintKeys: "J indietro • L avanti • R rigenera",

    keyStatus: "Stato chiave",
    keyTaken: "PRESA ✅",
    keyMissing: "MANCANTE ❌",

    sequence: "Sequenza",
    goToA: "Vai ad A",
    goToB: "Vai a B",
    goToExit: "OK ✅ vai all’Exit",

    addedOnlyFog: "Solo nebbia (base)",
    addedFarEndpoints: "Start/Exit lontani",
    addedNearButFar: "Exit vicina ma percorso lungo",
    addedKey: "Chiave singola (Exit bloccata finché non la prendi)",
    addedSequence: "Sequenza A → B → Exit (Exit bloccata finché non completi)",

    exitLocked: "BLOCCATA",
    exitUnlocked: "SBLOCCATA",

    language: "Lingua",

    enableSound: "Attiva audio",
    soundOn: "Audio: ON",
    soundOff: "Audio: OFF",

    continueSaved: "Riprendo dai progressi salvati",
  },

  es: {
    title: "Maze Game",
    level: "Nivel",
    unlocked: "Desbloqueados",
    fog: "Niebla",
    addedDifficulty: "Dificultad añadida en este nivel",
    reset: "Reiniciar",
    loading: "Cargando…",
    levels: "Niveles",
    hintKeys: "J atrás • L adelante • R regenerar",

    keyStatus: "Estado de la llave",
    keyTaken: "OBTENIDA ✅",
    keyMissing: "FALTA ❌",

    sequence: "Secuencia",
    goToA: "Ve a A",
    goToB: "Ve a B",
    goToExit: "OK ✅ ve a la salida",

    addedOnlyFog: "Solo niebla (base)",
    addedFarEndpoints: "Inicio/Salida muy alejados",
    addedNearButFar: "La salida parece cerca pero el camino es largo",
    addedKey: "Una llave (Salida bloqueada hasta recogerla)",
    addedSequence: "Secuencia A → B → Salida (bloqueada hasta completar)",

    exitLocked: "BLOQUEADA",
    exitUnlocked: "DESBLOQUEADA",

    language: "Idioma",

    enableSound: "Activar sonido",
    soundOn: "Sonido: ON",
    soundOff: "Sonido: OFF",

    continueSaved: "Continuando desde el progreso guardado",
  },

  fr: {
    title: "Maze Game",
    level: "Niveau",
    unlocked: "Débloqués",
    fog: "Brouillard",
    addedDifficulty: "Difficulté ajoutée à ce niveau",
    reset: "Réinitialiser",
    loading: "Chargement…",
    levels: "Niveaux",
    hintKeys: "J retour • L avance • R régénérer",

    keyStatus: "État de la clé",
    keyTaken: "PRISE ✅",
    keyMissing: "MANQUANTE ❌",

    sequence: "Séquence",
    goToA: "Aller à A",
    goToB: "Aller à B",
    goToExit: "OK ✅ aller à la sortie",

    addedOnlyFog: "Brouillard seulement (base)",
    addedFarEndpoints: "Départ/Sortie très éloignés",
    addedNearButFar: "La sortie semble proche mais le chemin est long",
    addedKey: "Une clé (sortie verrouillée jusqu’à la récupérer)",
    addedSequence: "Séquence A → B → Sortie (verrouillée jusqu’à compléter)",

    exitLocked: "VERROUILLÉE",
    exitUnlocked: "DÉVERROUILLÉE",

    language: "Langue",

    enableSound: "Activer le son",
    soundOn: "Son: ON",
    soundOff: "Son: OFF",

    continueSaved: "Reprise depuis la progression enregistrée",
  },

  de: {
    title: "Maze Game",
    level: "Level",
    unlocked: "Freigeschaltet",
    fog: "Nebel",
    addedDifficulty: "In diesem Level hinzugefügte Schwierigkeit",
    reset: "Zurücksetzen",
    loading: "Lädt…",
    levels: "Level",
    hintKeys: "J zurück • L vor • R neu generieren",

    keyStatus: "Schlüsselstatus",
    keyTaken: "GENOMMEN ✅",
    keyMissing: "FEHLT ❌",

    sequence: "Sequenz",
    goToA: "Gehe zu A",
    goToB: "Gehe zu B",
    goToExit: "OK ✅ zur Exit",

    addedOnlyFog: "Nur Nebel (Basis)",
    addedFarEndpoints: "Start/Exit weit auseinander",
    addedNearButFar: "Exit wirkt nah, aber der Weg ist lang",
    addedKey: "Ein Schlüssel (Exit gesperrt bis aufgenommen)",
    addedSequence: "Sequenz A → B → Exit (gesperrt bis abgeschlossen)",

    exitLocked: "GESPERRT",
    exitUnlocked: "FREI",

    language: "Sprache",

    enableSound: "Sound aktivieren",
    soundOn: "Sound: ON",
    soundOff: "Sound: OFF",

    continueSaved: "Fortsetzen mit gespeichertem Fortschritt",
  },

  pt: {
    title: "Maze Game",
    level: "Nível",
    unlocked: "Desbloqueados",
    fog: "Névoa",
    addedDifficulty: "Dificuldade adicionada neste nível",
    reset: "Reiniciar",
    loading: "Carregando…",
    levels: "Níveis",
    hintKeys: "J voltar • L avançar • R regenerar",

    keyStatus: "Estado da chave",
    keyTaken: "PEGOU ✅",
    keyMissing: "FALTA ❌",

    sequence: "Sequência",
    goToA: "Vá para A",
    goToB: "Vá para B",
    goToExit: "OK ✅ vá para a saída",

    addedOnlyFog: "Apenas névoa (base)",
    addedFarEndpoints: "Início/Saída bem distantes",
    addedNearButFar: "A saída parece perto, mas o caminho é longo",
    addedKey: "Uma chave (saída travada até pegar)",
    addedSequence: "Sequência A → B → Saída (travada até completar)",

    exitLocked: "TRAVADA",
    exitUnlocked: "DESTRAVADA",

    language: "Idioma",

    enableSound: "Ativar som",
    soundOn: "Som: ON",
    soundOff: "Som: OFF",

    continueSaved: "Continuando do progresso salvo",
  },

  ro: {
    title: "Maze Game",
    level: "Nivel",
    unlocked: "Deblocate",
    fog: "Ceață",
    addedDifficulty: "Dificultate adăugată la acest nivel",
    reset: "Reset",
    loading: "Se încarcă…",
    levels: "Niveluri",
    hintKeys: "J înapoi • L înainte • R regenerează",

    keyStatus: "Stare cheie",
    keyTaken: "LUATĂ ✅",
    keyMissing: "LIPSEȘTE ❌",

    sequence: "Secvență",
    goToA: "Mergi la A",
    goToB: "Mergi la B",
    goToExit: "OK ✅ mergi la ieșire",

    addedOnlyFog: "Doar ceață (bază)",
    addedFarEndpoints: "Start/Ieșire foarte departe",
    addedNearButFar: "Ieșirea pare aproape, dar drumul e lung",
    addedKey: "O cheie (ieșirea blocată până o iei)",
    addedSequence: "Secvență A → B → Ieșire (blocată până finalizezi)",

    exitLocked: "BLOCATĂ",
    exitUnlocked: "DEBLOCATĂ",

    language: "Limbă",

    enableSound: "Activează sunet",
    soundOn: "Sunet: ON",
    soundOff: "Sunet: OFF",

    continueSaved: "Continui de la progresul salvat",
  },
};

function modeForLevel(level: number, t: I18n): { mode: LevelMode; added: string } {
  if (level < 3) return { mode: "BASE", added: t.addedOnlyFog };

  const cycle = (level - 3) % 4;
  if (cycle === 0) return { mode: "FAR_ENDPOINTS", added: t.addedFarEndpoints };
  if (cycle === 1) return { mode: "NEAR_BUT_FAR", added: t.addedNearButFar };
  if (cycle === 2) return { mode: "KEY", added: t.addedKey };
  return { mode: "SEQUENCE", added: t.addedSequence };
}

/** ---- progress keys ---- */
const LS_MAX = "maze_progress_maxLevel";
const LS_CUR = "maze_progress_currentLevel";
const LS_LANG = "maze_lang";

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [vh, setVh] = useState(800);

  // language
  const [lang, setLang] = useState<Lang>("en");
  const t = useMemo(() => I18N[lang], [lang]);

  // progress
  const [maxLevelReached, setMaxLevelReached] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [loadedProgress, setLoadedProgress] = useState(false);

  const [{ w, h }, setSize] = useState(() => levelToSize(1));
  const levelRule = useMemo(() => modeForLevel(currentLevel, t), [currentLevel, t]);

  const [levels, setLevels] = useState<
    Record<number, { maze: Maze; start: Pos; exit: Pos; mode: LevelMode; keyPos: Pos | null; checkpoints: Pos[] }>
  >({});

  const [maze, setMaze] = useState<Maze | null>(null);
  const [start, setStart] = useState<Pos>({ x: 0, y: 0 });
  const [exit, setExit] = useState<Pos>({ x: 0, y: 0 });
  const [mode, setMode] = useState<LevelMode>("BASE");

  const [keyPos, setKeyPos] = useState<Pos | null>(null);
  const [checkpoints, setCheckpoints] = useState<Pos[]>([]);

  const [player, setPlayer] = useState<Pos>({ x: 0, y: 0 });

  const [hasKey, setHasKey] = useState(false);
  const [seqIndex, setSeqIndex] = useState(0);

  // Fog always ON, fixed 7x7 => radius 3
  const FOG_RADIUS = 3;
  const [seen, setSeen] = useState<boolean[][]>([]);

  // 🔊 SFX
  const moveSfxRef = useRef<HTMLAudioElement | null>(null);
  const winSfxRef = useRef<HTMLAudioElement | null>(null);
  const wonThisLevelRef = useRef(false);

  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVh(window.innerHeight);
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /** restore language + progress (client only) */
  useEffect(() => {
    if (!mounted) return;

    try {
      const savedLang = window.localStorage.getItem(LS_LANG) as Lang | null;
      if (savedLang && savedLang in I18N) setLang(savedLang);
    } catch {}

    try {
      const savedMax = Number(window.localStorage.getItem(LS_MAX) ?? "1");
      const savedCur = Number(window.localStorage.getItem(LS_CUR) ?? "1");

      const maxOk = Number.isFinite(savedMax) && savedMax >= 1 ? Math.floor(savedMax) : 1;
      const curOk = Number.isFinite(savedCur) && savedCur >= 1 ? Math.floor(savedCur) : 1;

      const curClamped = Math.min(curOk, maxOk);

      setMaxLevelReached(maxOk);
      setCurrentLevel(curClamped);

      if (maxOk > 1 || curClamped > 1) setLoadedProgress(true);
    } catch {}

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  /** persist language */
  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(LS_LANG, lang);
    } catch {}
  }, [lang, mounted]);

  /** persist progress */
  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(LS_MAX, String(maxLevelReached));
      window.localStorage.setItem(LS_CUR, String(currentLevel));
    } catch {}
  }, [mounted, maxLevelReached, currentLevel]);

  /** init audio objects (client only) */
  useEffect(() => {
    if (!mounted) return;

    const a = new Audio("/sfx/drop.wav");
    a.volume = 0.45;
    a.preload = "auto";
    moveSfxRef.current = a;

    const w = new Audio("/sfx/win.wav");
    w.volume = 0.6;
    w.preload = "auto";
    winSfxRef.current = w;
  }, [mounted]);

  function enableSound() {
    setSoundEnabled(true);

    const a = moveSfxRef.current;
    if (a) {
      a.muted = true;
      a.currentTime = 0;
      a.play()
        .then(() => {
          a.pause();
          a.muted = false;
        })
        .catch(() => {
          a.muted = false;
        });
    }
  }

  function playMoveSfx() {
    if (!soundEnabled) return;
    const a = moveSfxRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  }

  function playWinSfx() {
    if (!soundEnabled) return;
    const w = winSfxRef.current;
    if (!w) return;
    w.currentTime = 0;
    w.play().catch(() => {});
  }

  /** generate/load level */
  useEffect(() => {
    if (!mounted) return;

    const next = levelToSize(currentLevel);
    setSize(next);

    setLevels((prev) => {
      if (prev[currentLevel]) return prev;
      const gen = generateLevel(next.w, next.h, levelRule.mode);
      return {
        ...prev,
        [currentLevel]: {
          maze: gen.maze,
          start: gen.start,
          exit: gen.exit,
          mode: gen.mode,
          keyPos: gen.keyPos,
          checkpoints: gen.checkpoints,
        },
      };
    });
  }, [mounted, currentLevel, levelRule.mode]);

  /** apply level */
  useEffect(() => {
    const L = levels[currentLevel];
    if (!L) return;

    setMaze(L.maze);
    setStart(L.start);
    setExit(L.exit);
    setMode(L.mode);
    setKeyPos(L.keyPos);
    setCheckpoints(L.checkpoints);

    setPlayer(L.start);
    setHasKey(false);
    setSeqIndex(0);
    wonThisLevelRef.current = false;

    setSeen(Array.from({ length: L.maze.height }, () => Array.from({ length: L.maze.width }, () => false)));
  }, [levels, currentLevel]);

  /** fog update */
  useEffect(() => {
    if (!maze) return;

    setSeen((prev) => {
      if (prev.length !== maze.height || prev[0]?.length !== maze.width) {
        prev = Array.from({ length: maze.height }, () => Array.from({ length: maze.width }, () => false));
      }
      const copy = prev.map((r) => r.slice());
      for (let yy = player.y - FOG_RADIUS; yy <= player.y + FOG_RADIUS; yy++) {
        for (let xx = player.x - FOG_RADIUS; xx <= player.x + FOG_RADIUS; xx++) {
          if (xx >= 0 && yy >= 0 && xx < maze.width && yy < maze.height) copy[yy][xx] = true;
        }
      }
      return copy;
    });
  }, [player, maze]);

  function isExitUnlocked() {
    if (mode === "KEY") return hasKey;
    if (mode === "SEQUENCE") return seqIndex >= 2;
    return true;
  }

  /** key / sequence */
  useEffect(() => {
    if (!maze) return;

    if (mode === "KEY" && keyPos && player.x === keyPos.x && player.y === keyPos.y) {
      setHasKey(true);
    }

    if (mode === "SEQUENCE" && checkpoints.length === 2) {
      const target = checkpoints[seqIndex];
      if (target && player.x === target.x && player.y === target.y) {
        setSeqIndex((i) => Math.min(2, i + 1));
      }
    }
  }, [player, maze, mode, keyPos, checkpoints, seqIndex]);

  /** win */
  useEffect(() => {
    if (!maze) return;
    if (!isExitUnlocked()) return;

    if (player.x === exit.x && player.y === exit.y) {
      if (!wonThisLevelRef.current) {
        wonThisLevelRef.current = true;
        playWinSfx();
      }

      setTimeout(() => {
        setMaxLevelReached((max) => Math.max(max, currentLevel + 1));
        setCurrentLevel((lv) => lv + 1);
      }, 250);
    }
  }, [player, exit, maze, currentLevel, mode, hasKey, seqIndex]);

  function move(dir: Dir) {
    if (!maze) return;

    setPlayer((p) => {
      if (!canMove(maze, p.x, p.y, dir)) return p;

      playMoveSfx();

      if (dir === "N") return { x: p.x, y: p.y - 1 };
      if (dir === "S") return { x: p.x, y: p.y + 1 };
      if (dir === "E") return { x: p.x + 1, y: p.y };
      return { x: p.x - 1, y: p.y };
    });
  }

  /** keyboard */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const k = e.key.toLowerCase();

      if (k === "arrowup" || k === "w") move("N");
      if (k === "arrowdown" || k === "s") move("S");
      if (k === "arrowleft" || k === "a") move("W");
      if (k === "arrowright" || k === "d") move("E");

      if (k === "j") setCurrentLevel((lv) => Math.max(1, lv - 1));
      if (k === "l") setCurrentLevel((lv) => Math.min(maxLevelReached, lv + 1));

      if (k === "r") {
        const next = levelToSize(currentLevel);
        const gen = generateLevel(next.w, next.h, levelRule.mode);
        setLevels((prev) => ({
          ...prev,
          [currentLevel]: {
            maze: gen.maze,
            start: gen.start,
            exit: gen.exit,
            mode: gen.mode,
            keyPos: gen.keyPos,
            checkpoints: gen.checkpoints,
          },
        }));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maze, currentLevel, maxLevelReached, levelRule.mode, soundEnabled]);

  function resetAll() {
    setMaxLevelReached(1);
    setCurrentLevel(1);
    setLevels({});
    setMaze(null);
    setPlayer({ x: 0, y: 0 });
    setSeen([]);
    setHasKey(false);
    setSeqIndex(0);
    wonThisLevelRef.current = false;
    setLoadedProgress(false);

    try {
      window.localStorage.removeItem(LS_MAX);
      window.localStorage.removeItem(LS_CUR);
    } catch {}
  }

  const cellSize = Math.max(14, Math.floor(Math.min(560, vh - 320) / Math.max(w, h)));
  const wall = 4;
  const padding = wall + 3;
  const inner = cellSize - padding * 2;
  const dotSize = Math.max(6, Math.floor(inner * 0.65));
  const dotOffset = (inner - dotSize) / 2;
  const dotX = player.x * cellSize + padding + dotOffset;
  const dotY = player.y * cellSize + padding + dotOffset;

  const canGoPrev = currentLevel > 1;
  const canGoNext = currentLevel < maxLevelReached;

  const exitUnlocked = isExitUnlocked();

  return (
    <main style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: 16 }}>
      {/* pulse keyframes */}
      <style jsx global>{`
        @keyframes keyPulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            filter: drop-shadow(0 0 0 rgba(255, 215, 0, 0));
            opacity: 0.95;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.08);
            filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.85));
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            filter: drop-shadow(0 0 0 rgba(255, 215, 0, 0));
            opacity: 0.95;
          }
        }
      `}</style>

      <div style={{ width: "min(94vw, 980px)" }}>
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, margin: 0 }}>{t.title}</h1>

            <p style={{ margin: "6px 0 0", opacity: 0.85, lineHeight: 1.35 }}>
              {t.level} <b>{currentLevel}</b> ({t.unlocked}: <b>{maxLevelReached}</b>) — {w}×{h} • {t.fog}:{" "}
              <b>7×7</b>
            </p>

            {loadedProgress ? (
              <p style={{ margin: "6px 0 0", opacity: 0.8 }}>{t.continueSaved} ✅</p>
            ) : null}

            <p style={{ margin: "6px 0 0", opacity: 0.9 }}>
              <b>{t.addedDifficulty}:</b> {levelRule.added}
            </p>

            {mode === "KEY" ? (
              <p style={{ margin: "6px 0 0", opacity: 0.8 }}>
                {t.keyStatus}: <b>{hasKey ? t.keyTaken : t.keyMissing}</b>
              </p>
            ) : null}

            {mode === "SEQUENCE" && checkpoints.length === 2 ? (
              <p style={{ margin: "6px 0 0", opacity: 0.8 }}>
                {t.sequence}: <b>{seqIndex === 0 ? t.goToA : seqIndex === 1 ? t.goToB : t.goToExit}</b>
              </p>
            ) : null}

            <p style={{ margin: "6px 0 0", opacity: 0.75, fontSize: 12 }}>
              {soundEnabled ? t.soundOn : t.soundOff}
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, opacity: 0.8 }}>
              {t.language}
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.18)",
                  background: "white",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                {(Object.keys(LANG_LABELS) as Lang[]).map((code) => (
                  <option key={code} value={code}>
                    {LANG_LABELS[code]}
                  </option>
                ))}
              </select>
            </label>

            {!soundEnabled ? (
              <button
                onClick={enableSound}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: "white",
                  cursor: "pointer",
                  alignSelf: "flex-end",
                }}
              >
                {t.enableSound}
              </button>
            ) : null}

            <button
              onClick={resetAll}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.15)",
                background: "white",
                cursor: "pointer",
                alignSelf: "flex-end",
              }}
            >
              {t.reset}
            </button>
          </div>
        </header>

        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 18,
            border: "1px solid rgba(0,0,0,0.12)",
            background: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {!maze ? (
            <div style={{ padding: 16, opacity: 0.7 }}>{t.loading}</div>
          ) : (
            <div style={{ position: "relative", width: w * cellSize, height: h * cellSize, background: "#fff" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  gridTemplateColumns: `repeat(${w}, ${cellSize}px)`,
                  gridTemplateRows: `repeat(${h}, ${cellSize}px)`,
                }}
              >
                {maze.cells.flat().map((cell) => {
                  const isStart = cell.x === start.x && cell.y === start.y;
                  const isExit = cell.x === exit.x && cell.y === exit.y;

                  const visible = isStart || isExit || seen[cell.y]?.[cell.x] === true;

                  // fog covers walls too
                  if (!visible) {
                    return (
                      <div
                        key={`${cell.x}-${cell.y}`}
                        style={{
                          width: cellSize,
                          height: cellSize,
                          boxSizing: "border-box",
                          background: "#000",
                          border: `${wall}px solid #000`,
                        }}
                      />
                    );
                  }

                  const isKeyCell = keyPos && cell.x === keyPos.x && cell.y === keyPos.y;
                  const isA = checkpoints[0] && cell.x === checkpoints[0].x && cell.y === checkpoints[0].y;
                  const isB = checkpoints[1] && cell.x === checkpoints[1].x && cell.y === checkpoints[1].y;

                  const bg =
                    isExit
                      ? exitUnlocked
                        ? "rgba(0, 255, 140, 0.42)"
                        : "rgba(255, 80, 80, 0.40)"
                      : isStart
                        ? "rgba(40, 140, 255, 0.45)"
                        : isA
                          ? seqIndex >= 1
                            ? "rgba(255, 165, 0, 0.18)"
                            : "rgba(255, 165, 0, 0.35)"
                          : isB
                            ? seqIndex >= 2
                              ? "rgba(200, 120, 255, 0.18)"
                              : "rgba(200, 120, 255, 0.35)"
                            : "#fff";

                  const glow =
                    isExit
                      ? exitUnlocked
                        ? "0 0 14px rgba(0,255,140,0.95)"
                        : "0 0 14px rgba(255,80,80,0.95)"
                      : isStart
                        ? "0 0 14px rgba(40,140,255,0.95)"
                        : "none";

                  return (
                    <div
                      key={`${cell.x}-${cell.y}`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        boxSizing: "border-box",
                        borderTop: cell.walls.N ? `${wall}px solid #111` : `${wall}px solid #fff`,
                        borderRight: cell.walls.E ? `${wall}px solid #111` : `${wall}px solid #fff`,
                        borderBottom: cell.walls.S ? `${wall}px solid #111` : `${wall}px solid #fff`,
                        borderLeft: cell.walls.W ? `${wall}px solid #111` : `${wall}px solid #fff`,
                        background: bg,
                        boxShadow: glow,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Key image overlay + PULSE */}
                      {isKeyCell && !hasKey ? (
                        <img
                          src="/img/key.png"
                          alt="Key"
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            width: Math.floor(cellSize * 0.62),
                            height: Math.floor(cellSize * 0.62),
                            pointerEvents: "none",
                            userSelect: "none",
                            animation: "keyPulse 1.1s ease-in-out infinite",
                          }}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: dotSize,
                  height: dotSize,
                  borderRadius: 999,
                  background: "#111",
                  transform: `translate(${dotX}px, ${dotY}px)`,
                  transition: "transform 90ms linear",
                  pointerEvents: "none",
                }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: 12,
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.12)",
            background: "white",
          }}
        >
          <button
            onClick={() => setCurrentLevel((lv) => Math.max(1, lv - 1))}
            disabled={!canGoPrev}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.15)",
              background: canGoPrev ? "white" : "rgba(0,0,0,0.04)",
              cursor: canGoPrev ? "pointer" : "not-allowed",
              opacity: canGoPrev ? 1 : 0.5,
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ←
          </button>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, opacity: 0.8 }}>{t.levels}</div>
            <div style={{ fontSize: 16 }}>
              <b>{currentLevel}</b> / {maxLevelReached}
            </div>
            <div style={{ fontSize: 12, opacity: 0.65 }}>{t.hintKeys}</div>
          </div>

          <button
            onClick={() => setCurrentLevel((lv) => Math.min(maxLevelReached, lv + 1))}
            disabled={!canGoNext}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.15)",
              background: canGoNext ? "white" : "rgba(0,0,0,0.04)",
              cursor: canGoNext ? "pointer" : "not-allowed",
              opacity: canGoNext ? 1 : 0.5,
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            →
          </button>
        </div>

        {maze ? (
          <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
            Exit: <b>{exitUnlocked ? t.exitUnlocked : t.exitLocked}</b>
          </div>
        ) : null}
      </div>
    </main>
  );
}
