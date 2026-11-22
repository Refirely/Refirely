import type { VideoSceneSpec } from './promoVideoEngine';

interface KokoroRawAudio {
  audio: Float32Array;
  sampling_rate: number;
}

interface KokoroTtsRuntime {
  generate(
    text: string,
    options?: {
      voice?: KokoroVoiceId;
      speed?: number;
    }
  ): Promise<KokoroRawAudio>;
}

interface KokoroModuleExports {
  KokoroTTS: {
    from_pretrained(
      modelId: string,
      options?: {
        dtype?: 'fp32' | 'fp16' | 'q8' | 'q4' | 'q4f16';
        device?: 'wasm' | 'webgpu' | 'cpu' | null;
        progress_callback?: (progress: unknown) => void;
      }
    ): Promise<KokoroTtsRuntime>;
  };
}

const KOKORO_CDN_URLS = [
  'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js',
  'https://unpkg.com/kokoro-js@1.2.1/dist/kokoro.web.js',
];

async function loadKokoroWebModule(): Promise<KokoroModuleExports> {
  let lastError: unknown = null;
  for (const url of KOKORO_CDN_URLS) {
    try {
      const mod = (await import(/* @vite-ignore */ url)) as Partial<KokoroModuleExports>;
      if (mod?.KokoroTTS && typeof mod.KokoroTTS.from_pretrained === 'function') {
        return mod as KokoroModuleExports;
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('Unable to load Kokoro browser neural TTS module from CDN.');
}

export type KokoroVoiceId =
  | 'af_heart'
  | 'af_bella'
  | 'af_sarah'
  | 'af_nova'
  | 'af_nicole'
  | 'af_aoede'
  | 'af_sky'
  | 'bf_emma'
  | 'bf_isabella'
  | 'bf_alice'
  | 'am_adam'
  | 'bm_george';

export interface NeuralVoiceOption {
  id: KokoroVoiceId;
  label: string;
  accent: 'US' | 'UK';
  gender: 'Female' | 'Male';
  note: string;
}

export const NEURAL_VOICE_OPTIONS: NeuralVoiceOption[] = [
  {
    id: 'af_heart',
    label: 'Heart (US Female · Warm & Natural)',
    accent: 'US',
    gender: 'Female',
    note: 'Top Rated · Best for Reels & YouTube',
  },
  {
    id: 'af_bella',
    label: 'Bella (US Female · Bright & Clear)',
    accent: 'US',
    gender: 'Female',
    note: 'Crisp & Energetic',
  },
  {
    id: 'af_sarah',
    label: 'Sarah (US Female · Polished Host)',
    accent: 'US',
    gender: 'Female',
    note: 'Editorial & Smooth',
  },
  {
    id: 'af_nova',
    label: 'Nova (US Female · Upbeat Social)',
    accent: 'US',
    gender: 'Female',
    note: 'Modern Promo Style',
  },
  {
    id: 'af_nicole',
    label: 'Nicole (US Female · Soft & Calm)',
    accent: 'US',
    gender: 'Female',
    note: 'Relaxed Lifestyle Tone',
  },
  {
    id: 'af_aoede',
    label: 'Aoede (US Female · Expressive)',
    accent: 'US',
    gender: 'Female',
    note: 'Storytelling Clarity',
  },
  {
    id: 'af_sky',
    label: 'Sky (US Female · Light & Friendly)',
    accent: 'US',
    gender: 'Female',
    note: 'Casual Travel Vibe',
  },
  {
    id: 'bf_emma',
    label: 'Emma (UK Female · Refined Editorial)',
    accent: 'UK',
    gender: 'Female',
    note: 'British Documentary Feel',
  },
  {
    id: 'bf_isabella',
    label: 'Isabella (UK Female · Warm British)',
    accent: 'UK',
    gender: 'Female',
    note: 'Smooth & Articulate',
  },
  {
    id: 'bf_alice',
    label: 'Alice (UK Female · Crisp British)',
    accent: 'UK',
    gender: 'Female',
    note: 'Clear Financial Delivery',
  },
  {
    id: 'am_adam',
    label: 'Adam (US Male · Optional)',
    accent: 'US',
    gender: 'Male',
    note: 'Deep Narrator',
  },
  {
    id: 'bm_george',
    label: 'George (UK Male · Optional)',
    accent: 'UK',
    gender: 'Male',
    note: 'British Narrator',
  },
];

export interface TtsProgressInfo {
  stage: 'loading-model' | 'synthesizing' | 'ready';
  message: string;
  percent: number; // 0..100
}

export interface SynthesizedSceneAudio {
  sceneId: string;
  buffer: AudioBuffer;
  rawDurationSec: number;
}

export interface AlignedSceneTrack {
  scene: VideoSceneSpec;
  buffer: AudioBuffer | null;
  audioStartSec: number;
  audioDurationSec: number;
  playbackRate: number;
}

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';

let kokoroInstancePromise: Promise<KokoroTtsRuntime> | null = null;
let kokoroLoadedInstance: KokoroTtsRuntime | null = null;

interface CachedPcmEntry {
  samples: Float32Array;
  sampleRate: number;
}

const pcmMemoryCache = new Map<string, CachedPcmEntry>();

export function isNeuralTtsReady(): boolean {
  return kokoroLoadedInstance !== null;
}

/**
 * Lazily loads the 100% browser-local Kokoro-82M neural TTS model (zero paid API calls).
 * After the first download (~80MB quantized q8), the browser caches weights locally via Cache API.
 */
export async function getOrLoadNeuralTts(
  onProgress?: (info: TtsProgressInfo) => void
): Promise<KokoroTtsRuntime> {
  if (kokoroLoadedInstance) {
    return kokoroLoadedInstance;
  }

  if (!kokoroInstancePromise) {
    onProgress?.({
      stage: 'loading-model',
      message: 'Loading local neural female voice engine (one-time browser cache)...',
      percent: 5,
    });

    kokoroInstancePromise = (async () => {
      const { KokoroTTS: KokoroClass } = await loadKokoroWebModule();
      const instance = await KokoroClass.from_pretrained(MODEL_ID, {
        dtype: 'q8',
        device: 'wasm',
        progress_callback: (progressData: unknown) => {
          const p = progressData as {
            status?: string;
            progress?: number;
            file?: string;
            loaded?: number;
            total?: number;
          };
          if (typeof p?.progress === 'number' && Number.isFinite(p.progress)) {
            const pct = Math.max(5, Math.min(98, Math.round(p.progress)));
            onProgress?.({
              stage: 'loading-model',
              message: `Caching neural female voice weights locally (${pct}%)...`,
              percent: pct,
            });
          } else if (p?.status === 'initiate' || p?.status === 'download') {
            onProgress?.({
              stage: 'loading-model',
              message: 'Downloading free local Kokoro-82M female voice model...',
              percent: 15,
            });
          }
        },
      });
      kokoroLoadedInstance = instance;
      onProgress?.({
        stage: 'ready',
        message: 'Local neural female voice ready',
        percent: 100,
      });
      return instance;
    })().catch(err => {
      kokoroInstancePromise = null;
      throw err;
    });
  }

  return kokoroInstancePromise;
}

/**
 * Cleans spoken copy so numbers, symbols, and domain names sound crisp and natural in Kokoro TTS.
 */
function normalizeTextForSpeech(raw: string): string {
  return (raw || '')
    .replace(/Refirely\.com/gi, 'Refirely dot com')
    .replace(/ReFIREly\.com/gi, 'Refirely dot com')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Trims leading/trailing dead silence while preserving a crisp natural breath margin,
 * and normalizes vocal peak loudness so the female narrator cuts clearly above background music.
 */
function trimAndNormalizePcm(rawSamples: Float32Array, sampleRate: number): Float32Array {
  if (!rawSamples || rawSamples.length === 0) return rawSamples;
  const threshold = 0.008;
  let start = 0;
  let end = rawSamples.length - 1;

  while (start < end && Math.abs(rawSamples[start]) < threshold) start++;
  while (end > start && Math.abs(rawSamples[end]) < threshold) end--;

  const padSamples = Math.round(sampleRate * 0.045); // 45ms clean breath margin
  const sliceStart = Math.max(0, start - padSamples);
  const sliceEnd = Math.min(rawSamples.length, end + padSamples);
  const sliced = rawSamples.slice(sliceStart, sliceEnd);

  let peak = 0;
  for (let i = 0; i < sliced.length; i++) {
    const v = Math.abs(sliced[i]);
    if (v > peak) peak = v;
  }

  if (peak > 0.01) {
    const targetPeak = 0.92;
    const gain = Math.min(2.2, targetPeak / peak);
    for (let i = 0; i < sliced.length; i++) {
      sliced[i] = Math.max(-0.98, Math.min(0.98, sliced[i] * gain));
    }
  }
  return sliced;
}

function pcmToAudioBuffer(audioCtx: AudioContext, samples: Float32Array, sampleRate: number): AudioBuffer {
  const buffer = audioCtx.createBuffer(1, Math.max(1, samples.length), sampleRate);
  buffer.getChannelData(0).set(samples);
  return buffer;
}

/**
 * Synthesizes a single line of text into a real Web Audio API AudioBuffer (baked directly into MP4/WebM).
 */
export async function synthesizeNeuralSpeechBuffer(params: {
  audioCtx: AudioContext;
  text: string;
  voice: KokoroVoiceId;
  speed: number;
  onProgress?: (info: TtsProgressInfo) => void;
}): Promise<AudioBuffer> {
  const { audioCtx, text, voice, speed, onProgress } = params;
  const normalizedText = normalizeTextForSpeech(text);
  const clampedSpeed = Math.max(0.75, Math.min(2.0, Number(speed.toFixed(2))));
  const cacheKey = `${voice}|${clampedSpeed}|${normalizedText}`;

  const cached = pcmMemoryCache.get(cacheKey);
  if (cached) {
    return pcmToAudioBuffer(audioCtx, cached.samples, cached.sampleRate);
  }

  const tts = await getOrLoadNeuralTts(onProgress);
  const rawAudio = await tts.generate(normalizedText, {
    voice,
    speed: clampedSpeed,
  });

  const sampleRate = rawAudio.sampling_rate || 24000;
  const processed = trimAndNormalizePcm(rawAudio.audio, sampleRate);

  // Keep memory cache bounded
  if (pcmMemoryCache.size > 80) {
    const firstKey = pcmMemoryCache.keys().next().value;
    if (firstKey) pcmMemoryCache.delete(firstKey);
  }
  pcmMemoryCache.set(cacheKey, { samples: processed, sampleRate });

  return pcmToAudioBuffer(audioCtx, processed, sampleRate);
}

/**
 * Synthesizes all scene voiceover clips into real AudioBuffers before recording/playback begins,
 * so the female voice is 100% embedded inside the MediaRecorder MP4/WebM audio stream and
 * perfectly synchronized with every visual scene transition.
 */
export async function synthesizeAllSceneAudioBuffers(params: {
  audioCtx: AudioContext;
  scenes: VideoSceneSpec[];
  voice: KokoroVoiceId;
  speed: number;
  onProgress?: (info: TtsProgressInfo) => void;
}): Promise<SynthesizedSceneAudio[]> {
  const { audioCtx, scenes, voice, speed, onProgress } = params;

  await getOrLoadNeuralTts(onProgress);

  const results: SynthesizedSceneAudio[] = [];
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const pct = Math.round(((i + 0.25) / scenes.length) * 100);
    onProgress?.({
      stage: 'synthesizing',
      message: `Synthesizing female voiceover · Scene ${i + 1} of ${scenes.length} (${scene.shortTitle})...`,
      percent: pct,
    });

    const buffer = await synthesizeNeuralSpeechBuffer({
      audioCtx,
      text: scene.text,
      voice,
      speed,
      onProgress,
    });

    results.push({
      sceneId: scene.id,
      buffer,
      rawDurationSec: buffer.duration,
    });
  }

  onProgress?.({
    stage: 'ready',
    message: `All ${scenes.length} voiceover clips synthesized & synced`,
    percent: 100,
  });

  return results;
}

/**
 * Aligns every scene's visual startSec & durationSec to its EXACT synthesized AudioBuffer duration
 * so visuals switch in lockstep with the female narrator and zero words are ever clipped.
 */
export function alignTimelineToSynthesizedAudio(params: {
  scenes: VideoSceneSpec[];
  synthesized: SynthesizedSceneAudio[];
  targetDurationSec: number;
  holdUntilVoiceFinishes: boolean;
}): {
  alignedTracks: AlignedSceneTrack[];
  alignedScenes: VideoSceneSpec[];
  finalDurationSec: number;
} {
  const { scenes, synthesized, targetDurationSec, holdUntilVoiceFinishes } = params;
  const gapSec = 0.2;
  const outroHoldPadSec = 0.45;

  const rawSpeechSum = synthesized.reduce((sum, s) => sum + s.rawDurationSec, 0);
  const gapsSum = Math.max(0, scenes.length - 1) * gapSec + outroHoldPadSec;
  const totalNaturalSec = rawSpeechSum + gapsSum;

  // If natural speech is slightly longer than targetDurationSec:
  // - When holdUntilVoiceFinishes is ON, allow a mild speed-up up to 1.12x to stay crisp, and extend finalDurationSec if still needed.
  // - When Strict Cutoff is ON, fit playbackRate up to 1.38x so all text still finishes inside targetDurationSec.
  let rateMultiplier = 1.0;
  if (totalNaturalSec > targetDurationSec) {
    const neededRate = rawSpeechSum / Math.max(2, targetDurationSec - gapsSum);
    rateMultiplier = holdUntilVoiceFinishes
      ? Math.min(1.12, Math.max(1.0, neededRate))
      : Math.min(1.38, Math.max(1.0, neededRate));
  }

  const effectiveSpeechDurs = synthesized.map(s => s.rawDurationSec / rateMultiplier);
  const totalEffectiveSec = effectiveSpeechDurs.reduce((a, b) => a + b, 0) + gapsSum;

  // Extra visual cushion when speech finishes earlier than targetDurationSec (distributed nicely across scenes, favoring outro)
  const spareSec = Math.max(0, targetDurationSec - totalEffectiveSec);
  const perSceneExtra = scenes.length > 0 ? (spareSec * 0.65) / scenes.length : 0;
  const outroExtra = spareSec * 0.35;

  let cursor = 0;
  const alignedTracks: AlignedSceneTrack[] = [];
  const alignedScenes: VideoSceneSpec[] = [];

  scenes.forEach((scene, idx) => {
    const synth = synthesized[idx];
    const spokenDur = effectiveSpeechDurs[idx] || 2.0;
    const isLast = idx === scenes.length - 1;
    const sceneDur =
      spokenDur +
      (isLast ? outroHoldPadSec + outroExtra : gapSec) +
      perSceneExtra;

    const startSec = Number(cursor.toFixed(3));
    const roundedDur = Number(sceneDur.toFixed(3));

    const updatedScene: VideoSceneSpec = {
      ...scene,
      startSec,
      durationSec: roundedDur,
    };

    alignedScenes.push(updatedScene);
    alignedTracks.push({
      scene: updatedScene,
      buffer: synth?.buffer || null,
      audioStartSec: startSec + 0.05,
      audioDurationSec: spokenDur,
      playbackRate: rateMultiplier,
    });

    cursor += roundedDur;
  });

  const finalDurationSec = holdUntilVoiceFinishes
    ? Math.max(targetDurationSec, Number(cursor.toFixed(2)))
    : targetDurationSec;

  return {
    alignedTracks,
    alignedScenes,
    finalDurationSec,
  };
}
