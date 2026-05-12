'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Trash2, MapPin, Clock, Zap, TrendingUp, ChevronDown, ChevronUp, Navigation2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Run, RunPoint } from '@/lib/types';

// ── Haversine distance ──────────────────────────────────────────
function haversine(a: RunPoint, b: RunPoint): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function totalDistance(points: RunPoint[]): number {
  let d = 0;
  for (let i = 1; i < points.length; i++) d += haversine(points[i - 1], points[i]);
  return d;
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function formatPace(secPerKm: number): string {
  if (!isFinite(secPerKm) || secPerKm <= 0) return '--:--';
  const m = Math.floor(secPerKm / 60);
  const s = Math.floor(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(2)}km`;
}

// ── SVG Route ──────────────────────────────────────────────────
function RouteMap({ points, running }: { points: RunPoint[]; running: boolean }) {
  if (points.length < 2) {
    return (
      <div className="w-full h-52 rounded-2xl bg-white/5 border border-white/8 flex flex-col items-center justify-center gap-2 text-gray-600">
        <Navigation2 size={28} />
        <span className="text-sm">Route appears here</span>
      </div>
    );
  }

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 0.0001;
  const lngRange = maxLng - minLng || 0.0001;
  const padding = 20;
  const W = 300;
  const H = 180;

  const px = (p: RunPoint) =>
    padding + ((p.lng - minLng) / lngRange) * (W - padding * 2);
  const py = (p: RunPoint) =>
    padding + ((1 - (p.lat - minLat) / latRange) * (H - padding * 2));

  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p).toFixed(1)} ${py(p).toFixed(1)}`).join(' ');
  const last = points[points.length - 1];
  const first = points[0];

  return (
    <div className="w-full rounded-2xl bg-[#0a1a12] border border-[#00ff88]/20 overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
        {/* Grid */}
        {[...Array(4)].map((_, i) => (
          <line
            key={i}
            x1={0} y1={(H / 4) * i} x2={W} y2={(H / 4) * i}
            stroke="rgba(0,255,136,0.05)" strokeWidth={0.5}
          />
        ))}

        {/* Route glow */}
        <path d={d} fill="none" stroke="#00ff88" strokeWidth={5} strokeOpacity={0.15} strokeLinecap="round" strokeLinejoin="round" />
        {/* Route line */}
        <path d={d} fill="none" stroke="#00ff88" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Start dot */}
        <circle cx={px(first)} cy={py(first)} r={5} fill="#00ff88" opacity={0.9} />
        <circle cx={px(first)} cy={py(first)} r={3} fill="#0d0d0d" />

        {/* Current position */}
        {running && (
          <>
            <circle cx={px(last)} cy={py(last)} r={8} fill="#00ff88" opacity={0.2} />
            <circle cx={px(last)} cy={py(last)} r={5} fill="#00ff88" />
          </>
        )}
        {!running && (
          <circle cx={px(last)} cy={py(last)} r={5} fill="#ff4444" />
        )}
      </svg>
    </div>
  );
}

// ── Run History Card ────────────────────────────────────────────
function RunCard({ run, onDelete }: { run: Run; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const date = new Date(run.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
      <div className="flex items-center gap-3 p-4" onClick={() => setOpen((o) => !o)}>
        <div className="w-10 h-10 rounded-xl bg-[#00ff88]/15 flex items-center justify-center flex-shrink-0">
          <Navigation2 size={18} className="text-[#00ff88]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm">{run.title || date}</div>
          <div className="text-xs text-gray-500">
            {formatDistance(run.distanceMeters)} · {formatDuration(run.durationMs)} · {formatPace(run.avgPaceSecPerKm)}/km
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-gray-700 hover:text-red-400 transition-colors"
          >
            <Trash2 size={15} />
          </button>
          {open ? <ChevronUp size={16} className="text-gray-600" /> : <ChevronDown size={16} className="text-gray-600" />}
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4">
          <RouteMap points={run.points} running={false} />
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────
export default function RunTracker() {
  const { state, saveRun, deleteRun } = useApp();
  const [running, setRunning] = useState(false);
  const [points, setPoints] = useState<RunPoint[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dist = totalDistance(points);
  const paceSecPerKm = elapsed > 0 && dist > 0 ? elapsed / 1000 / (dist / 1000) : 0;

  const startRun = useCallback(() => {
    setGpsError(null);
    setPoints([]);
    const now = Date.now();
    setStartTime(now);
    setElapsed(0);
    setRunning(true);

    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - now);
    }, 1000);

    if (!navigator.geolocation) {
      setGpsError('GPS not available on this device.');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const point: RunPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: pos.timestamp,
          altitude: pos.coords.altitude ?? undefined,
        };
        setPoints((prev) => {
          // Filter jitter: skip if < 3m from last point
          if (prev.length > 0 && haversine(prev[prev.length - 1], point) < 3) return prev;
          return [...prev, point];
        });
      },
      (err) => {
        setGpsError(`GPS error: ${err.message}`);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
  }, []);

  const stopRun = useCallback(() => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);

    const now = Date.now();
    const durationMs = startTime ? now - startTime : elapsed;
    const distanceMeters = dist;
    const avgPace = durationMs > 0 && distanceMeters > 0 ? durationMs / 1000 / (distanceMeters / 1000) : 0;

    if (distanceMeters > 10) {
      const run: Run = {
        id: now.toString(),
        date: new Date().toISOString().split('T')[0],
        startTime: startTime ?? now,
        endTime: now,
        durationMs,
        distanceMeters,
        points,
        avgPaceSecPerKm: avgPace,
      };
      saveRun(run);
    }

    setPoints([]);
    setElapsed(0);
    setStartTime(null);
  }, [startTime, elapsed, dist, points, saveRun]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const totalRunDist = state.runs.reduce((a, r) => a + r.distanceMeters, 0);
  const totalRunTime = state.runs.reduce((a, r) => a + r.durationMs, 0);

  return (
    <div className="px-4 pb-32">
      {/* Header */}
      <div className="pt-12 pb-5">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Run <span className="text-[#00ff88]">Tracker</span>
        </h1>
      </div>

      {/* Active run panel */}
      {running ? (
        <div className="bg-[#0a1a12] rounded-2xl border border-[#00ff88]/30 p-5 mb-5">
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="text-center">
              <div className="text-3xl font-black text-white font-mono">{formatDuration(elapsed)}</div>
              <div className="text-xs text-gray-500 mt-0.5">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#00ff88] font-mono">{formatDistance(dist)}</div>
              <div className="text-xs text-gray-500 mt-0.5">Distance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white font-mono">{formatPace(paceSecPerKm)}</div>
              <div className="text-xs text-gray-500 mt-0.5">/km Pace</div>
            </div>
          </div>

          <RouteMap points={points} running={true} />

          {gpsError && (
            <div className="mt-3 text-xs text-orange-400 bg-orange-400/10 rounded-xl p-3">{gpsError}</div>
          )}

          <button
            onClick={stopRun}
            className="w-full mt-4 py-4 rounded-xl bg-red-500/90 text-white font-black text-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors active:scale-95"
          >
            <Square size={20} fill="white" />
            Stop Run
          </button>
        </div>
      ) : (
        <>
          {/* Start button */}
          <div className="flex flex-col items-center mb-6">
            <button
              onClick={startRun}
              className="w-32 h-32 rounded-full bg-[#00ff88] text-black flex flex-col items-center justify-center gap-1 shadow-lg shadow-[#00ff88]/30 hover:bg-[#00dd77] transition-all active:scale-95"
            >
              <Play size={32} fill="black" />
              <span className="font-black text-sm tracking-widest">START</span>
            </button>
            <p className="text-gray-600 text-xs mt-3">Tap to begin GPS tracking</p>
          </div>

          {gpsError && (
            <div className="mb-4 text-xs text-orange-400 bg-orange-400/10 rounded-xl p-3">{gpsError}</div>
          )}
        </>
      )}

      {/* All-time stats */}
      {state.runs.length > 0 && !running && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/8">
            <div className="text-lg font-black text-[#00ff88]">{state.runs.length}</div>
            <div className="text-xs text-gray-500">Runs</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/8">
            <div className="text-lg font-black text-white">{formatDistance(totalRunDist)}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/8">
            <div className="text-lg font-black text-white">{formatDuration(totalRunTime)}</div>
            <div className="text-xs text-gray-500">Time</div>
          </div>
        </div>
      )}

      {/* Run history */}
      {!running && state.runs.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-gray-400 mb-3 tracking-widest">ACTIVITY</h2>
          <div className="space-y-3">
            {state.runs.map((run) => (
              <RunCard key={run.id} run={run} onDelete={() => deleteRun(run.id)} />
            ))}
          </div>
        </>
      )}

      {!running && state.runs.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          <Navigation2 size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Your runs will appear here.</p>
        </div>
      )}
    </div>
  );
}
