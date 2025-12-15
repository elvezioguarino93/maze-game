export type Dir = "N" | "E" | "S" | "W";

export type Cell = {
  x: number;
  y: number;
  walls: Record<Dir, boolean>; // true = muro presente
  visited: boolean;
};

export type Maze = {
  width: number;
  height: number;
  cells: Cell[][];
};

export type Pos = { x: number; y: number };

const DIRS: { d: Dir; dx: number; dy: number; opposite: Dir }[] = [
  { d: "N", dx: 0, dy: -1, opposite: "S" },
  { d: "E", dx: 1, dy: 0, opposite: "W" },
  { d: "S", dx: 0, dy: 1, opposite: "N" },
  { d: "W", dx: -1, dy: 0, opposite: "E" },
];

function randInt(max: number) {
  return Math.floor(Math.random() * max);
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateMaze(width: number, height: number): Maze {
  const cells: Cell[][] = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      x,
      y,
      visited: false,
      walls: { N: true, E: true, S: true, W: true },
    }))
  );

  const stack: Cell[] = [];
  let current = cells[0][0];
  current.visited = true;

  while (true) {
    const neighbors = shuffle(DIRS)
      .map(({ d, dx, dy, opposite }) => {
        const nx = current.x + dx;
        const ny = current.y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) return null;
        const next = cells[ny][nx];
        if (next.visited) return null;
        return { d, next, opposite };
      })
      .filter(Boolean) as { d: Dir; next: Cell; opposite: Dir }[];

    if (neighbors.length > 0) {
      const pick = neighbors[0];
      current.walls[pick.d] = false;
      pick.next.walls[pick.opposite] = false;

      stack.push(current);
      current = pick.next;
      current.visited = true;
    } else if (stack.length > 0) {
      current = stack.pop()!;
    } else {
      break;
    }
  }

  for (const row of cells) for (const c of row) c.visited = false;

  return { width, height, cells };
}

function inBounds(maze: Maze, x: number, y: number) {
  return x >= 0 && y >= 0 && x < maze.width && y < maze.height;
}

export function canMove(maze: Maze, x: number, y: number, dir: Dir) {
  if (!inBounds(maze, x, y)) return false;

  const from = maze.cells[y][x];

  let nx = x;
  let ny = y;
  let opposite: Dir;

  if (dir === "N") {
    ny -= 1;
    opposite = "S";
  } else if (dir === "S") {
    ny += 1;
    opposite = "N";
  } else if (dir === "E") {
    nx += 1;
    opposite = "W";
  } else {
    nx -= 1;
    opposite = "E";
  }

  if (!inBounds(maze, nx, ny)) return false;

  const to = maze.cells[ny][nx];
  return from.walls[dir] === false && to.walls[opposite] === false;
}

type BfsResult = {
  dist: number[][];
  farthest: { pos: Pos; d: number };
  prev: (Pos | null)[][];
};

export function bfsAll(maze: Maze, start: Pos): BfsResult {
  const dist = Array.from({ length: maze.height }, () => Array(maze.width).fill(-1));
  const prev: (Pos | null)[][] = Array.from({ length: maze.height }, () => Array(maze.width).fill(null));
  const q: Pos[] = [start];
  dist[start.y][start.x] = 0;

  let farthest = { pos: start, d: 0 };

  while (q.length) {
    const cur = q.shift()!;
    const d0 = dist[cur.y][cur.x];

    if (d0 > farthest.d) farthest = { pos: cur, d: d0 };

    for (const m of DIRS) {
      if (!canMove(maze, cur.x, cur.y, m.d)) continue;
      const nx = cur.x + m.dx;
      const ny = cur.y + m.dy;
      if (dist[ny][nx] !== -1) continue;
      dist[ny][nx] = d0 + 1;
      prev[ny][nx] = cur;
      q.push({ x: nx, y: ny });
    }
  }

  return { dist, farthest, prev };
}

export function shortestPath(maze: Maze, start: Pos, goal: Pos): { path: Pos[] | null; dist: number | null } {
  const { dist, prev } = bfsAll(maze, start);
  const d = dist[goal.y][goal.x];
  if (d === -1) return { path: null, dist: null };

  const path: Pos[] = [];
  let cur: Pos | null = goal;
  while (cur) {
    path.push(cur);
    cur = prev[cur.y][cur.x];
  }
  path.reverse();
  return { path, dist: d };
}

/** start/exit molto lontani (diametro approssimato) */
export function farthestEndpoints(maze: Maze): { start: Pos; exit: Pos; optLen: number } {
  const s0 = { x: randInt(maze.width), y: randInt(maze.height) };
  const a = bfsAll(maze, s0).farthest.pos;
  const bfsA = bfsAll(maze, a);
  const b = bfsA.farthest.pos;
  return { start: a, exit: b, optLen: bfsA.farthest.d };
}

/**
 * Exit vicina (Manhattan <= 2) ma percorso lungo:
 * cerca coppie start/exit vicine con distanza BFS alta.
 */
export function nearButFarEndpoints(
  maze: Maze,
  minDist: number
): { start: Pos; exit: Pos; optLen: number } {
  const tries = 600;

  for (let t = 0; t < tries; t++) {
    const s: Pos = { x: randInt(maze.width), y: randInt(maze.height) };

    // candidate exit vicina
    const candidates: Pos[] = [];
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = s.x + dx;
        const ny = s.y + dy;
        if (nx < 0 || ny < 0 || nx >= maze.width || ny >= maze.height) continue;
        const man = Math.abs(dx) + Math.abs(dy);
        if (man === 0 || man > 2) continue;
        candidates.push({ x: nx, y: ny });
      }
    }
    if (!candidates.length) continue;

    const bfsS = bfsAll(maze, s);
    const exit = candidates[randInt(candidates.length)];
    const d = bfsS.dist[exit.y][exit.x];
    if (d >= minDist) return { start: s, exit, optLen: d };
  }

  // fallback: se non trova vicino-ma-lontano, usa farthest
  return farthestEndpoints(maze);
}

export type LevelMode =
  | "BASE"
  | "FAR_ENDPOINTS"
  | "NEAR_BUT_FAR"
  | "KEY"
  | "SEQUENCE";

export type GeneratedLevel = {
  maze: Maze;
  start: Pos;
  exit: Pos;
  optLen: number;

  mode: LevelMode;

  keyPos: Pos | null;
  checkpoints: Pos[]; // per SEQUENCE: [A,B]
};

function pickFarCell(maze: Maze, from: Pos, minDistance: number): Pos {
  const bfs = bfsAll(maze, from);
  const candidates: Pos[] = [];
  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      if (bfs.dist[y][x] >= minDistance) candidates.push({ x, y });
    }
  }
  if (candidates.length) return candidates[randInt(candidates.length)];
  return bfs.farthest.pos;
}

/**
 * Generatore “da gioco” senza loop/trail/stamina.
 * - mode decide la logica non intuitiva del livello.
 */
export function generateLevel(width: number, height: number, mode: LevelMode): GeneratedLevel {
  for (let tries = 0; tries < 250; tries++) {
    const maze = generateMaze(width, height);

    let start: Pos = { x: 0, y: 0 };
    let exit: Pos = { x: width - 1, y: height - 1 };
    let optLen = 0;

    if (mode === "BASE") {
      // start/exit “classici” ma assicurati che siano collegati
      start = { x: 0, y: 0 };
      exit = { x: width - 1, y: height - 1 };
      const s = shortestPath(maze, start, exit);
      if (!s.path) continue;
      optLen = s.dist ?? 0;
      return { maze, start, exit, optLen, mode, keyPos: null, checkpoints: [] };
    }

    if (mode === "FAR_ENDPOINTS") {
      const fe = farthestEndpoints(maze);
      start = fe.start;
      exit = fe.exit;
      optLen = fe.optLen;
      return { maze, start, exit, optLen, mode, keyPos: null, checkpoints: [] };
    }

    if (mode === "NEAR_BUT_FAR") {
      const threshold = Math.floor((width * height) / 2); // abbastanza “lungo”
      const nf = nearButFarEndpoints(maze, threshold);
      start = nf.start;
      exit = nf.exit;
      optLen = nf.optLen;
      return { maze, start, exit, optLen, mode, keyPos: null, checkpoints: [] };
    }

    if (mode === "KEY") {
      const fe = farthestEndpoints(maze);
      start = fe.start;
      exit = fe.exit;
      optLen = fe.optLen;

      // key lontana dallo start, ma non per forza sul percorso ottimale
      const keyPos = pickFarCell(maze, start, Math.max(6, Math.floor(optLen * 0.35)));
      // assicurati che key sia raggiungibile e che dopo key si possa andare all’exit
      const p1 = shortestPath(maze, start, keyPos);
      const p2 = shortestPath(maze, keyPos, exit);
      if (!p1.path || !p2.path) continue;

      return { maze, start, exit, optLen, mode, keyPos, checkpoints: [] };
    }

    if (mode === "SEQUENCE") {
      const fe = farthestEndpoints(maze);
      start = fe.start;
      exit = fe.exit;
      optLen = fe.optLen;

      // checkpoint A e B: lontani tra loro e non troppo vicini a start/exit
      const A = pickFarCell(maze, start, Math.max(6, Math.floor(optLen * 0.25)));
      const B = pickFarCell(maze, A, Math.max(6, Math.floor(optLen * 0.25)));

      const p1 = shortestPath(maze, start, A);
      const p2 = shortestPath(maze, A, B);
      const p3 = shortestPath(maze, B, exit);
      if (!p1.path || !p2.path || !p3.path) continue;

      return { maze, start, exit, optLen, mode, keyPos: null, checkpoints: [A, B] };
    }
  }

  // fallback robusto
  const maze = generateMaze(width, height);
  const fe = farthestEndpoints(maze);
  return { maze, start: fe.start, exit: fe.exit, optLen: fe.optLen, mode: "FAR_ENDPOINTS", keyPos: null, checkpoints: [] };
}
