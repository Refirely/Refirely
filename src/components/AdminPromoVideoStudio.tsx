import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Country } from '../types';
import {
  buildPromoVideoBlueprint,
  buildVideoSocialCopy,
  computeRecommendedSpeechRate,
  estimateSpeechDurationSec,
  loadCanvasSafeImage,
  pickBestVideoMimeType,
  rebalanceSceneTimingsByText,
  renderPromoVideoFrame,
  scheduleFintechAmbientTrack,
  VIDEO_DIMENSIONS,
  VideoDurationSec,
  VideoOrientation,
  VideoSceneSpec,
} from '../utils/promoVideoEngine';
import {
  alignTimelineToSynthesizedAudio,
  KokoroVoiceId,
  NEURAL_VOICE_OPTIONS,
  synthesizeAllSceneAudioBuffers,
  synthesizeNeuralSpeechBuffer,
  TtsProgressInfo,
} from '../utils/localNeuralTts';
import {
  Check,
  Clock,
  Copy,
  Download,
  Film,
  Loader2,
  Mic,
  Monitor,
  Music,
  Play,
  RotateCcw,
  Smartphone,
  Sparkles,
  Square,
  Upload,
  Volume2,
  Wand2,
} from 'lucide-react';

interface AdminPromoVideoStudioProps {
  countries: Country[];
  selectedCountryId: string;
  onSelectCountryId: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const AdminPromoVideoStudio: React.FC<AdminPromoVideoStudioProps> = ({
  countries,
  selectedCountryId,
  onSelectCountryId,
  onShowToast,
}) => {
  const [comparisonCountryId, setComparisonCountryId] = useState<string>('auto');
  const [durationSec, setDurationSec] = useState<VideoDurationSec>(15);
  const [orientation, setOrientation] = useState<VideoOrientation>('vertical');
  const [includeAmbientMusic, setIncludeAmbientMusic] = useState<boolean>(true);
  const [speechRate, setSpeechRate] = useState<number>(1.3);
  const [autoFitPaceEnabled, setAutoFitPaceEnabled] = useState<boolean>(true);
  const [holdUntilVoiceFinishes, setHoldUntilVoiceFinishes] = useState<boolean>(true);

  // 100% Browser-Local Kokoro-82M Neural Female Voices (real Web Audio AudioBuffers embedded in MP4/WebM!)
  const [selectedNeuralVoice, setSelectedNeuralVoice] = useState<KokoroVoiceId>('af_heart');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isSynthesizingVoice, setIsSynthesizingVoice] = useState<boolean>(false);
  const [isTestingVoice, setIsTestingVoice] = useState<boolean>(false);
  const [ttsProgress, setTtsProgress] = useState<TtsProgressInfo | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [customAudioFile, setCustomAudioFile] = useState<{ name: string; buffer: AudioBuffer } | null>(null);
  const [activeTotalDurationSec, setActiveTotalDurationSec] = useState<number>(15);
  const [recordedHasVoice, setRecordedHasVoice] = useState<boolean>(true);

  const selectedCountry = useMemo(
    () => countries.find(c => c.id === selectedCountryId) || countries[0],
    [countries, selectedCountryId]
  );

  const baseBlueprint = useMemo(
    () => buildPromoVideoBlueprint(selectedCountry, countries, durationSec, comparisonCountryId),
    [selectedCountry, countries, durationSec, comparisonCountryId]
  );

  // Editable per-scene narration scripts
  const [customSceneTexts, setCustomSceneTexts] = useState<Record<string, string>>({});
  const [activePreviewSceneIdx, setActivePreviewSceneIdx] = useState<number>(0);

  // Live preview & MediaRecorder export states
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [isExportingVideo, setIsExportingVideo] = useState<boolean>(false);
  const [playbackCurrentSec, setPlaybackCurrentSec] = useState<number>(0);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedFilename, setRecordedFilename] = useState<string>('');
  const [recordedExtension, setRecordedExtension] = useState<'mp4' | 'webm'>('webm');
  const [copiedCopyField, setCopiedCopyField] = useState<'title' | 'desc' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const photoImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeAudioNodesRef = useRef<AudioNode[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const cancelledRef = useRef<boolean>(false);
  const customAudioInputRef = useRef<HTMLInputElement | null>(null);

  // Reset script overrides when country, comparison country, or duration changes
  useEffect(() => {
    setCustomSceneTexts({});
    setActivePreviewSceneIdx(0);
    setPlaybackCurrentSec(0);
    setPlaybackProgress(0);
    setActiveTotalDurationSec(durationSec);
  }, [selectedCountry.id, comparisonCountryId, durationSec]);

  // Cleanup recorded blob URL
  useEffect(() => {
    return () => {
      if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    };
  }, [recordedVideoUrl]);

  // Dynamically rebalance scene durations proportionally to each scene's spoken word count
  const effectiveScenes: VideoSceneSpec[] = useMemo(() => {
    const withCustomText = baseBlueprint.scenes.map(scene => ({
      ...scene,
      text: customSceneTexts[scene.id] ?? scene.text,
    }));
    return rebalanceSceneTimingsByText(withCustomText, durationSec);
  }, [baseBlueprint.scenes, customSceneTexts, durationSec]);

  const recommendedSpeechRate = useMemo(
    () => computeRecommendedSpeechRate(effectiveScenes, durationSec),
    [effectiveScenes, durationSec]
  );

  const estimatedVoiceDurationSec = useMemo(
    () => estimateSpeechDurationSec(effectiveScenes, speechRate),
    [effectiveScenes, speechRate]
  );

  // When Auto-Fit Pace is ON, keep speechRate automatically tuned whenever country, duration, or script changes
  useEffect(() => {
    if (autoFitPaceEnabled) {
      setSpeechRate(recommendedSpeechRate);
    }
  }, [autoFitPaceEnabled, recommendedSpeechRate]);

  const socialCopy = useMemo(
    () => buildVideoSocialCopy(baseBlueprint, orientation),
    [baseBlueprint, orientation]
  );

  // Draw a static preview frame for any selected scene
  const drawStaticSceneFrame = useCallback(
    (sceneIdx: number, ratio = 0.78) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dims = VIDEO_DIMENSIONS[orientation];
      if (canvas.width !== dims.width || canvas.height !== dims.height) {
        canvas.width = dims.width;
        canvas.height = dims.height;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const target = effectiveScenes[sceneIdx] || effectiveScenes[0];
      const timeSec = target.startSec + target.durationSec * ratio;
      renderPromoVideoFrame({
        ctx,
        orientation,
        blueprint: baseBlueprint,
        scenes: effectiveScenes,
        currentTimeSec: timeSec,
        photoImg: photoImgRef.current,
        logoImg: logoImgRef.current,
      });
    },
    [orientation, baseBlueprint, effectiveScenes]
  );

  // Preload local ReFIREly logo + CORS-safe country photo
  useEffect(() => {
    let cancelled = false;
    const loadAssets = async () => {
      const [logo, photo] = await Promise.all([
        loadCanvasSafeImage('/assets/aistudio/refirely-icon.png'),
        loadCanvasSafeImage(baseBlueprint.photoUrl),
      ]);
      const safePhoto = photo || (await loadCanvasSafeImage('/assets/og/explore-havens.jpg'));
      if (cancelled) return;
      logoImgRef.current = logo;
      photoImgRef.current = safePhoto;
      if (!isPlayingPreview && !isExportingVideo) {
        drawStaticSceneFrame(activePreviewSceneIdx, 0.78);
      }
    };
    loadAssets();
    return () => {
      cancelled = true;
    };
  }, [baseBlueprint.photoUrl, orientation, activePreviewSceneIdx, isPlayingPreview, isExportingVideo, drawStaticSceneFrame]);

  useEffect(() => {
    if (!isPlayingPreview && !isExportingVideo) {
      drawStaticSceneFrame(activePreviewSceneIdx, 0.78);
    }
  }, [drawStaticSceneFrame, activePreviewSceneIdx, isPlayingPreview, isExportingVideo]);

  // Redraw canvas automatically once Google Fonts finish loading or if admin switches site font in FontThemeStudio
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let active = true;
    const redrawIfIdle = () => {
      if (active && !isPlayingPreview && !isExportingVideo) {
        drawStaticSceneFrame(activePreviewSceneIdx, 0.78);
      }
    };
    document.fonts?.ready?.then(redrawIfIdle).catch(() => {});
    const observer = new MutationObserver(() => {
      setTimeout(redrawIfIdle, 80);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [drawStaticSceneFrame, activePreviewSceneIdx, isPlayingPreview, isExportingVideo]);

  const stopAll = useCallback(() => {
    cancelledRef.current = true;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    activeAudioNodesRef.current.forEach(node => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore
      }
    });
    activeAudioNodesRef.current = [];

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    mediaRecorderRef.current = null;
    setIsSynthesizingVoice(false);
    setIsTestingVoice(false);
    setIsPlayingPreview(false);
    setIsExportingVideo(false);
  }, []);

  useEffect(() => {
    return () => {
      stopAll();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopAll]);

  const getOrCreateAudioContext = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    return audioCtxRef.current;
  };

  const handleUploadCustomVoiceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const audioCtx = getOrCreateAudioContext();
      const arrayBuf = await file.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(arrayBuf.slice(0));
      setCustomAudioFile({ name: file.name, buffer: decoded });
      setTtsError(null);
      onShowToast(`Loaded custom voiceover "${file.name}" (${decoded.duration.toFixed(1)}s) — ready to embed in video!`);
    } catch {
      onShowToast('Could not decode that audio file. Please upload a valid MP3, WAV, or M4A file.');
    } finally {
      if (customAudioInputRef.current) customAudioInputRef.current.value = '';
    }
  };

  const handleTestVoice = async () => {
    if (!voiceEnabled) return;
    stopAll();
    setTtsError(null);
    setIsTestingVoice(true);
    try {
      const audioCtx = getOrCreateAudioContext();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      const sampleText = `Welcome to Refirely. Discover ${selectedCountry.name} from ${selectedCountry.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()} dollars a month.`;
      const buffer = await synthesizeNeuralSpeechBuffer({
        audioCtx,
        text: sampleText,
        voice: selectedNeuralVoice,
        speed: speechRate,
        onProgress: setTtsProgress,
      });
      const src = audioCtx.createBufferSource();
      src.buffer = buffer;
      src.connect(audioCtx.destination);
      activeAudioNodesRef.current.push(src);
      src.onended = () => setIsTestingVoice(false);
      src.start();
    } catch (err) {
      setIsTestingVoice(false);
      const msg = err instanceof Error ? err.message : 'Unable to load local neural voice model.';
      setTtsError(msg);
      onShowToast('Could not synthesize voice sample. Check connection or upload an MP3/WAV voiceover.');
    }
  };

  /**
   * Synthesizes real Web Audio female voiceover AudioBuffers locally via Kokoro-82M (100% free, zero API calls),
   * aligns every visual scene to the exact millisecond of its spoken voice clip, and routes BOTH the female voice
   * AND ducked ambient music directly into MediaRecorder's audio track so the downloaded MP4/WebM has full voice audio.
   */
  const startTimeline = async (mode: 'preview' | 'export') => {
    stopAll();
    cancelledRef.current = false;
    setTtsError(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const dims = VIDEO_DIMENSIONS[orientation];
    canvas.width = dims.width;
    canvas.height = dims.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (mode === 'export' && (typeof MediaRecorder === 'undefined' || typeof canvas.captureStream !== 'function')) {
      onShowToast('Your browser does not support MediaRecorder canvas video capture. Try Chrome or Edge.');
      return;
    }

    const audioCtx = getOrCreateAudioContext();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    // STEP 1: Prepare real Web Audio voiceover AudioBuffers BEFORE starting MediaRecorder
    let timelineScenes: VideoSceneSpec[] = effectiveScenes;
    let finalDurationSec: number = baseBlueprint.durationSec;
    let alignedTracks: Array<{
      buffer: AudioBuffer | null;
      audioStartSec: number;
      playbackRate: number;
    }> = [];
    let hasEmbeddedVoice = false;

    if (voiceEnabled && customAudioFile) {
      hasEmbeddedVoice = true;
      finalDurationSec = holdUntilVoiceFinishes
        ? Math.max(baseBlueprint.durationSec, Number((customAudioFile.buffer.duration + 0.5).toFixed(2)))
        : baseBlueprint.durationSec;
      timelineScenes = rebalanceSceneTimingsByText(effectiveScenes, finalDurationSec);
      alignedTracks = [
        {
          buffer: customAudioFile.buffer,
          audioStartSec: 0.08,
          playbackRate: 1.0,
        },
      ];
    } else if (voiceEnabled) {
      setIsSynthesizingVoice(true);
      try {
        const synthesized = await synthesizeAllSceneAudioBuffers({
          audioCtx,
          scenes: effectiveScenes,
          voice: selectedNeuralVoice,
          speed: speechRate,
          onProgress: setTtsProgress,
        });
        if (cancelledRef.current) {
          setIsSynthesizingVoice(false);
          return;
        }
        const aligned = alignTimelineToSynthesizedAudio({
          scenes: effectiveScenes,
          synthesized,
          targetDurationSec: baseBlueprint.durationSec,
          holdUntilVoiceFinishes,
        });
        timelineScenes = aligned.alignedScenes;
        finalDurationSec = aligned.finalDurationSec;
        alignedTracks = aligned.alignedTracks;
        hasEmbeddedVoice = true;
      } catch (err) {
        setIsSynthesizingVoice(false);
        const msg = err instanceof Error ? err.message : 'Failed to initialize local neural female voice.';
        setTtsError(msg);
        onShowToast('Local neural voice failed to load. You can retry or upload a custom MP3/WAV track.');
        return;
      }
      setIsSynthesizingVoice(false);
    }

    if (cancelledRef.current) return;
    setActiveTotalDurationSec(finalDurationSec);

    // STEP 2: Build Web Audio mixing bus (Female Voiceover + Ducked Ambient Music -> MediaRecorder + Speakers)
    const mixBus = audioCtx.createGain();
    mixBus.gain.value = 1.0;
    activeAudioNodesRef.current.push(mixBus);

    const voiceBus = audioCtx.createGain();
    voiceBus.gain.value = 1.0;
    voiceBus.connect(mixBus);
    activeAudioNodesRef.current.push(voiceBus);

    let streamDest: MediaStreamAudioDestinationNode | null = null;
    if (mode === 'export') {
      streamDest = audioCtx.createMediaStreamDestination();
      mixBus.connect(streamDest);
      const monitor = audioCtx.createGain();
      monitor.gain.value = 0.65;
      mixBus.connect(monitor);
      monitor.connect(audioCtx.destination);
      activeAudioNodesRef.current.push(monitor);
    } else {
      mixBus.connect(audioCtx.destination);
    }

    const chunks: Blob[] = [];
    const { mimeType, extension } = pickBestVideoMimeType();

    // Paint frame 0 cleanly BEFORE starting MediaRecorder so the video opens crisp with zero blank frame
    renderPromoVideoFrame({
      ctx,
      orientation,
      blueprint: { ...baseBlueprint, durationSec: finalDurationSec as VideoDurationSec },
      scenes: timelineScenes,
      currentTimeSec: 0,
      photoImg: photoImgRef.current,
      logoImg: logoImgRef.current,
    });

    if (mode === 'export') {
      setIsExportingVideo(true);

      const videoStream = canvas.captureStream(30);
      const combinedTracks = [
        ...videoStream.getVideoTracks(),
        ...(streamDest ? streamDest.stream.getAudioTracks() : []),
      ];
      const combinedStream = new MediaStream(combinedTracks);

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: orientation === 'horizontal' ? 7_500_000 : 6_000_000,
        audioBitsPerSecond: 192_000,
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        if (cancelledRef.current) return;
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const cleanCountry = selectedCountry.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const fileName = `refirely-${cleanCountry}-${durationSec}s.${extension}`;

        setRecordedVideoUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setRecordedFilename(fileName);
        setRecordedExtension(extension);
        setRecordedHasVoice(hasEmbeddedVoice);
        setIsExportingVideo(false);

        onShowToast(
          hasEmbeddedVoice
            ? `Rendered ${finalDurationSec.toFixed(1)}s video with embedded female voiceover + music! Ready to download.`
            : `Rendered ${finalDurationSec.toFixed(1)}s video! Preview ready below or click Download Video.`
        );
      };

      recorder.start(250);
    } else {
      setIsPlayingPreview(true);
    }

    // STEP 3: Schedule every synthesized female voice clip + ducked ambient music directly onto mixBus
    const audioStart = audioCtx.currentTime + 0.08;

    alignedTracks.forEach(track => {
      if (!track.buffer) return;
      const src = audioCtx.createBufferSource();
      src.buffer = track.buffer;
      src.playbackRate.value = track.playbackRate;
      src.connect(voiceBus);
      src.start(audioStart + track.audioStartSec);
      activeAudioNodesRef.current.push(src);
    });

    if (includeAmbientMusic) {
      // Duck ambient music cleanly to 0.052 when female voiceover is active so narration is broadcast-clear
      const musicVolume = hasEmbeddedVoice ? 0.052 : 0.11;
      const musicNodes = scheduleFintechAmbientTrack(audioCtx, mixBus, audioStart, finalDurationSec, musicVolume);
      activeAudioNodesRef.current.push(...musicNodes);
    } else if (mode === 'export' && !hasEmbeddedVoice) {
      const silentOsc = audioCtx.createOscillator();
      const silentGain = audioCtx.createGain();
      silentGain.gain.value = 0.00001;
      silentOsc.connect(silentGain);
      silentGain.connect(mixBus);
      silentOsc.start(audioStart);
      silentOsc.stop(audioStart + finalDurationSec + 0.1);
      activeAudioNodesRef.current.push(silentOsc, silentGain);
    }

    const wallStartMs = performance.now() + 80;

    const tick = (nowMs: number) => {
      if (cancelledRef.current) return;
      const elapsedSec = Math.max(0, (nowMs - wallStartMs) / 1000);
      const clampedSec = Math.min(finalDurationSec, elapsedSec);

      let sceneIdx = timelineScenes.length - 1;
      for (let i = 0; i < timelineScenes.length; i++) {
        const sc = timelineScenes[i];
        if (clampedSec >= sc.startSec && clampedSec < sc.startSec + sc.durationSec) {
          sceneIdx = i;
          break;
        }
      }
      setActivePreviewSceneIdx(sceneIdx);

      renderPromoVideoFrame({
        ctx,
        orientation,
        blueprint: baseBlueprint,
        scenes: timelineScenes,
        currentTimeSec: clampedSec,
        photoImg: photoImgRef.current,
        logoImg: logoImgRef.current,
      });

      setPlaybackCurrentSec(clampedSec);
      setPlaybackProgress(Math.min(1, clampedSec / Math.max(0.1, finalDurationSec)));

      if (elapsedSec < finalDurationSec) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        if (mode === 'export' && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          // Give MediaRecorder 180ms tail buffer so the final audio frames flush cleanly into the MP4/WebM
          setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
              mediaRecorderRef.current.stop();
            }
          }, 180);
        } else {
          setIsPlayingPreview(false);
        }
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const handleDownloadRecordedVideo = () => {
    if (!recordedVideoUrl || !recordedFilename) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = recordedFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast(`Downloaded ${recordedFilename}!`);
  };

  const handleCopySocialCopy = (field: 'title' | 'desc') => {
    const text = field === 'title' ? socialCopy.title : socialCopy.description;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedCopyField(field);
    setTimeout(() => setCopiedCopyField(null), 2200);
    onShowToast(field === 'title' ? 'Copied Video Title!' : 'Copied Description & Hashtags!');
  };

  const isBusy = isPlayingPreview || isExportingVideo || isSynthesizingVoice || isTestingVoice;

  return (
    <div className="w-full space-y-6">
      {/* =====================================================================
          HEADER & 100% LOCAL ZERO-API CONTROLS BAR
      ===================================================================== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50/75 via-white to-teal-50/70 rounded-3xl border border-indigo-200/80 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-100/90 text-indigo-950 border border-indigo-200">
                <Film className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>100% Local Browser Video Studio · Zero Paid APIs</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                <Mic className="w-3 h-3 text-teal-600 shrink-0" />
                <span>Neural Female Voice Embedded in MP4/WebM</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Country Promo Video Generator (15s &amp; 30s Reels / YouTube)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Renders animated <strong>15-second</strong> and <strong>30-second</strong> promo videos styled in Refirely&apos;s live light Indigo/Teal/Amber theme &amp; active typography, pulling directly from our 209-country dataset with <strong>local Kokoro neural female narration mixed directly into the downloadable MP4/WebM audio track</strong>.
            </p>
          </div>

          {/* Live Metric Badge */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-500 text-white text-xs font-extrabold shadow-xs">
              <Clock className="w-3.5 h-3.5 text-white" />
              <span>
                {durationSec}s · {VIDEO_DIMENSIONS[orientation].label}
              </span>
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {VIDEO_DIMENSIONS[orientation].platformHint}
            </span>
          </div>
        </div>

        {/* Row 1 Controls: Primary Country, Optional Comparison Country, Duration, Aspect Ratio */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3.5">
          {/* 1. Primary Country */}
          <div className="xl:col-span-3 space-y-1">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block">
              1. Country Dossier (209)
            </label>
            <select
              value={selectedCountry.id}
              disabled={isBusy}
              onChange={e => onSelectCountryId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            >
              {countries.map(c => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.name} (${c.costOfLiving.monthlyBudgetSingleUSD}/mo)
                </option>
              ))}
            </select>
          </div>

          {/* 2. Optional Comparison Country */}
          <div className="xl:col-span-3 space-y-1">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block">
              2. Compare Against (Optional)
            </label>
            <select
              value={comparisonCountryId}
              disabled={isBusy}
              onChange={e => setComparisonCountryId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            >
              <option value="auto">
                ✨ Auto Regional Peer ({baseBlueprint.comparisonCountry?.flag} {baseBlueprint.comparisonCountry?.name || 'Best Match'})
              </option>
              {countries
                .filter(c => c.id !== selectedCountry.id)
                .map(c => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.name} (${c.costOfLiving.monthlyBudgetSingleUSD}/mo)
                  </option>
                ))}
            </select>
          </div>

          {/* 3. Duration Selector (15s or 30s) */}
          <div className="xl:col-span-3 space-y-1">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block">
              3. Video Duration
            </label>
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setDurationSec(15)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer disabled:opacity-60 ${
                  durationSec === 15
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>15s Blitz</span>
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setDurationSec(30)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer disabled:opacity-60 ${
                  durationSec === 30
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>30s Full</span>
              </button>
            </div>
          </div>

          {/* 4. Aspect Ratio Selector (9:16 or 16:9) */}
          <div className="xl:col-span-3 space-y-1">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block">
              4. Aspect Ratio
            </label>
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setOrientation('vertical')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer disabled:opacity-60 ${
                  orientation === 'vertical'
                    ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span>9:16 Reels</span>
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setOrientation('horizontal')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer disabled:opacity-60 ${
                  orientation === 'horizontal'
                    ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 shrink-0" />
                <span>16:9 YT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2 Controls: Local Kokoro Neural Female Voice Selector (Embedded in MP4/WebM) + Audio-Video Sync */}
        <div className="p-4 rounded-2xl bg-white/90 border border-indigo-200/80 space-y-3.5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-end">
            <div className="lg:col-span-6 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  5. Local Neural Voiceover (Free · Mixed into MP4/WebM)
                </label>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-extrabold">
                  <Check className="w-3 h-3 text-teal-600" />
                  <span>Embedded in Download</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedNeuralVoice}
                  disabled={isBusy || !voiceEnabled || Boolean(customAudioFile)}
                  onChange={e => setSelectedNeuralVoice(e.target.value as KokoroVoiceId)}
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                >
                  {NEURAL_VOICE_OPTIONS.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.label} — {v.note}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={isBusy || !voiceEnabled || Boolean(customAudioFile)}
                  onClick={handleTestVoice}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-extrabold shrink-0 cursor-pointer disabled:opacity-60"
                >
                  {isTestingVoice ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isTestingVoice ? 'Playing...' : 'Test Voice'}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setVoiceEnabled(v => !v)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
                  voiceEnabled
                    ? 'bg-teal-50 border-teal-300 text-teal-900'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{voiceEnabled ? 'Voiceover On' : 'Voiceover Muted'}</span>
              </button>

              <button
                type="button"
                disabled={isBusy}
                onClick={() => setIncludeAmbientMusic(m => !m)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
                  includeAmbientMusic
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>{includeAmbientMusic ? 'Ducked Music On' : 'Music Off'}</span>
              </button>

              <button
                type="button"
                disabled={isBusy || !voiceEnabled}
                onClick={() => setHoldUntilVoiceFinishes(h => !h)}
                title="Automatically lock every scene's timing to the exact duration of its synthesized voice clip so no word is ever cut off"
                className={`px-3 py-2.5 rounded-xl border text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
                  holdUntilVoiceFinishes
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{holdUntilVoiceFinishes ? 'Never Cut Off Voice' : 'Strict Cutoff'}</span>
              </button>

              {/* Optional Custom Voiceover Upload (.mp3/.wav) */}
              <input
                ref={customAudioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleUploadCustomVoiceFile}
                className="hidden"
              />
              {customAudioFile ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 border border-violet-300 text-violet-950 text-xs font-bold">
                  <Upload className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                  <span className="max-w-[140px] truncate" title={customAudioFile.name}>
                    {customAudioFile.name}
                  </span>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setCustomAudioFile(null)}
                    className="ml-1 px-1.5 py-0.5 rounded-md bg-violet-200/80 hover:bg-violet-300 text-violet-950 text-[10px] font-extrabold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isBusy || !voiceEnabled}
                  onClick={() => customAudioInputRef.current?.click()}
                  title="Optional: upload your own recorded MP3/WAV narration to mix into the video instead of the neural voice"
                  className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload MP3/WAV</span>
                </button>
              )}
            </div>
          </div>

          {/* Local Neural Voice Model Loading / Synthesis Progress Banner */}
          {(isSynthesizingVoice || isTestingVoice) && ttsProgress && (
            <div className="p-3 rounded-xl bg-indigo-50/90 border border-indigo-200 space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-indigo-950">
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 shrink-0" />
                  <span>{ttsProgress.message}</span>
                </span>
                <span className="font-mono text-[11px] text-indigo-700">{Math.round(ttsProgress.percent)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-indigo-200/70 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 via-indigo-600 to-amber-500 transition-all duration-200"
                  style={{ width: `${Math.max(4, Math.min(100, Math.round(ttsProgress.percent)))}%` }}
                />
              </div>
              {ttsProgress.stage === 'loading-model' && (
                <p className="text-[11px] text-indigo-700">
                  First-time setup downloads the free local female voice model (~86 MB) and caches it permanently in your browser. Future renders start instantly!
                </p>
              )}
            </div>
          )}

          {ttsError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex flex-wrap items-center justify-between gap-2">
              <span>
                <strong>Local Voice Notice:</strong> {ttsError}
              </span>
              <button
                type="button"
                onClick={() => customAudioInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold cursor-pointer"
              >
                Upload MP3/WAV Instead
              </button>
            </div>
          )}

          {/* Fine-Grained Voice Speed Slider + Quick Speed Chips + Live Sync Meter */}
          <div className="pt-2.5 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            <div className="lg:col-span-7 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span>Voiceover Speed:</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono text-xs">
                    {speechRate.toFixed(2)}x
                  </span>
                </label>

                {/* Quick Speed Presets + Auto-Fit Button */}
                <div className="flex flex-wrap items-center gap-1">
                  {[1.0, 1.2, 1.35, 1.5, 1.75, 2.0].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      disabled={isBusy || !voiceEnabled}
                      onClick={() => {
                        setAutoFitPaceEnabled(false);
                        setSpeechRate(preset);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-colors cursor-pointer disabled:opacity-50 ${
                        Math.abs(speechRate - preset) < 0.02
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 hover:bg-indigo-50 text-slate-700'
                      }`}
                    >
                      {preset.toFixed(preset % 1 === 0 ? 1 : 2).replace(/0$/, '')}x
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={isBusy || !voiceEnabled}
                    onClick={() => {
                      setAutoFitPaceEnabled(true);
                      setSpeechRate(recommendedSpeechRate);
                      onShowToast(`Auto-synced voice speed to ${recommendedSpeechRate.toFixed(2)}x for ${durationSec}s video!`);
                    }}
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1 ${
                      autoFitPaceEnabled
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Auto-Fit ({recommendedSpeechRate.toFixed(2)}x)</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold text-slate-400">0.80x</span>
                <input
                  type="range"
                  min={0.8}
                  max={2.2}
                  step={0.05}
                  disabled={isBusy || !voiceEnabled}
                  value={speechRate}
                  onChange={e => {
                    setAutoFitPaceEnabled(false);
                    setSpeechRate(Number(e.target.value));
                  }}
                  className="flex-1 accent-emerald-600 cursor-pointer disabled:opacity-50"
                  aria-label="Voiceover speed slider"
                />
                <span className="text-[10px] font-mono font-bold text-slate-400">2.20x</span>
              </div>
            </div>

            {/* Live Audio-Video Sync Meter */}
            <div className="lg:col-span-5">
              {estimatedVoiceDurationSec <= durationSec ? (
                <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between gap-2">
                  <div>
                    <div className="font-extrabold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Audio &amp; Video Synced</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Est. voiceover <strong>{estimatedVoiceDurationSec.toFixed(1)}s</strong> fits inside <strong>{durationSec}.0s</strong> video
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center justify-between gap-2">
                  <div>
                    <div className="font-extrabold">
                      Voice (~{estimatedVoiceDurationSec.toFixed(1)}s) is longer than {durationSec}s
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Increase speed to <strong>{recommendedSpeechRate.toFixed(2)}x</strong> or shorten a line below.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      setAutoFitPaceEnabled(true);
                      setSpeechRate(recommendedSpeechRate);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-extrabold shrink-0 cursor-pointer"
                  >
                    Sync Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {!isBusy ? (
            <>
              <button
                type="button"
                onClick={() => startTimeline('preview')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-slate-900 border border-indigo-200 text-xs font-extrabold shadow-2xs transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 text-indigo-600" />
                <span>Live Preview ({durationSec}s + Voice &amp; Music)</span>
              </button>

              <button
                type="button"
                onClick={() => startTimeline('export')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-500 hover:opacity-95 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
              >
                <Film className="w-4 h-4" />
                <span>
                  Record {durationSec}s {orientation === 'vertical' ? '9:16 Vertical' : '16:9 Landscape'} Video
                </span>
              </button>

              {recordedVideoUrl && (
                <button
                  type="button"
                  onClick={handleDownloadRecordedVideo}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>⬇️ Download Video ({recordedFilename})</span>
                </button>
              )}
            </>
          ) : (
              <button
                type="button"
                onClick={stopAll}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>
                  {isSynthesizingVoice
                    ? 'Cancel Voice Synthesis'
                    : isExportingVideo
                      ? 'Stop Recording'
                      : isTestingVoice
                        ? 'Stop Voice Test'
                        : 'Stop Live Preview'}
                </span>
              </button>
          )}
        </div>
      </div>

      {/* =====================================================================
          MAIN WORKSPACE: LIVE CANVAS STAGE + RECORDED PLAYER + SCRIPT EDITOR
      ===================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ANIMATED CANVAS STAGE & DOWNLOADABLE VIDEO PLAYER */}
        <div className="xl:col-span-6 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900">
                  Live Canvas Stage ({VIDEO_DIMENSIONS[orientation].label})
                </span>
                {isSynthesizingVoice && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-extrabold">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    SYNTHESIZING VOICE
                  </span>
                )}
                {isExportingVideo && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-extrabold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    RECORDING VOICE + VIDEO
                  </span>
                )}
                {isPlayingPreview && !isExportingVideo && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-extrabold">
                    <Volume2 className="w-3 h-3" />
                    LIVE PREVIEW
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                {playbackCurrentSec.toFixed(1)}s / {activeTotalDurationSec.toFixed(1)}s
              </span>
            </div>

            {/* Canvas Container (Light Refirely Studio Frame) */}
            <div className="w-full rounded-2xl bg-gradient-to-br from-slate-100 via-indigo-50/70 to-teal-50/60 border border-indigo-200/80 p-3 sm:p-4 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={VIDEO_DIMENSIONS[orientation].width}
                height={VIDEO_DIMENSIONS[orientation].height}
                className={`rounded-2xl shadow-xl border border-indigo-200/90 bg-slate-50 ${
                  orientation === 'vertical'
                    ? 'w-full max-w-[330px] aspect-[9/16]'
                    : 'w-full aspect-[16/9]'
                }`}
              />
            </div>

            {/* Progress Bar & Scene Scrubber */}
            <div className="space-y-2.5">
              <div className="w-full h-2 rounded-full bg-indigo-100/70 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500 transition-all duration-100"
                  style={{ width: `${Math.round(playbackProgress * 100)}%` }}
                />
              </div>

              <div
                className={`grid gap-1.5 ${
                  effectiveScenes.length === 4 ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-6'
                }`}
              >
                {effectiveScenes.map((scene, idx) => (
                  <button
                    key={scene.id}
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      setActivePreviewSceneIdx(idx);
                      setPlaybackCurrentSec(scene.startSec);
                      setPlaybackProgress(scene.startSec / durationSec);
                    }}
                    className={`px-2 py-1.5 rounded-xl text-[10px] font-extrabold text-center transition-all cursor-pointer disabled:cursor-default truncate ${
                      activePreviewSceneIdx === idx
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-indigo-50 text-slate-700'
                    }`}
                    title={scene.label}
                  >
                    {idx + 1}. {scene.shortTitle}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Dataset Snapshot Card (Light Refirely Theme) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-teal-50/60 text-slate-900 border border-indigo-200/80 space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Live Metrics Pulled From Refirely 209-Country Dataset</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-teal-50/80 border border-teal-200/80">
                  <div className="text-[10px] text-teal-700 font-bold">RETIREE SOLO</div>
                  <div className="font-mono font-extrabold text-slate-900">
                    ${selectedCountry.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-indigo-50/80 border border-indigo-200/80">
                  <div className="text-[10px] text-indigo-700 font-bold">NOMAD / FIBER</div>
                  <div className="font-mono font-extrabold text-slate-900">
                    ${baseBlueprint.nomadBurnUSD.toLocaleString()} · {baseBlueprint.fiberMbps}M
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/80">
                  <div className="text-[10px] text-amber-700 font-bold">SAVE VS NYC</div>
                  <div className="font-mono font-extrabold text-slate-900">
                    {baseBlueprint.savingsPercentVsBaseline}% (${Math.round(baseBlueprint.annualSavingsVsBaseline / 1000)}K/yr)
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-violet-50/80 border border-violet-200/80">
                  <div className="text-[10px] text-violet-700 font-bold">HEALTH / SAFE</div>
                  <div className="font-mono font-extrabold text-slate-900">
                    {selectedCountry.lifestyle.healthcareScore} / {selectedCountry.lifestyle.safetyScore}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECORDED VIDEO PLAYBACK & DOWNLOAD CARD */}
          {recordedVideoUrl && (
            <div className="bg-gradient-to-br from-indigo-50 via-white to-teal-50 rounded-3xl border-2 border-indigo-200 p-4 sm:p-5 shadow-sm space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-extrabold text-indigo-950 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-teal-600" />
                      <span>Recorded Video Ready ({recordedExtension.toUpperCase()})</span>
                    </h3>
                    {recordedHasVoice && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 border border-teal-200 text-teal-900 text-[10px] font-extrabold">
                        <Mic className="w-3 h-3 text-teal-700" />
                        <span>Female Voiceover + Music Embedded</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono mt-0.5">{recordedFilename}</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadRecordedVideo}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-500 hover:opacity-95 text-white text-xs font-extrabold shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>⬇️ Download Video</span>
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden bg-slate-100 border border-indigo-200 flex justify-center">
                <video
                  src={recordedVideoUrl}
                  controls
                  playsInline
                  className={
                    orientation === 'vertical'
                      ? 'max-h-[460px] w-auto'
                      : 'w-full aspect-[16/9]'
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: EDITABLE SCRIPT + REELS / YOUTUBE COPY */}
        <div className="xl:col-span-6 space-y-5">
          {/* Editable Voiceover Script */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-indigo-600" />
                  <span>Dynamic {durationSec}s Voiceover Script ({effectiveScenes.length} Scenes)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Synthesized locally via Kokoro Neural TTS &amp; embedded directly inside the downloaded MP4/WebM audio track. Click any scene to preview its chart.
                </p>
              </div>
              {Object.keys(customSceneTexts).length > 0 && (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => setCustomSceneTexts({})}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {effectiveScenes.map((scene, idx) => {
                const isActive = activePreviewSceneIdx === idx;
                return (
                  <div
                    key={scene.id}
                    onClick={() => {
                      if (!isBusy) setActivePreviewSceneIdx(idx);
                    }}
                    className={`p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-extrabold text-slate-900">{scene.label}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-emerald-700">
                        {scene.durationSec.toFixed(1)}s
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      disabled={isBusy}
                      value={scene.text}
                      onChange={e =>
                        setCustomSceneTexts(prev => ({
                          ...prev,
                          [scene.id]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none disabled:opacity-70"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ready-to-Post Reels / YouTube Title & Description */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                Ready-to-Post {orientation === 'vertical' ? 'Instagram Reels / Shorts' : 'YouTube'} Copy
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopySocialCopy('title')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-extrabold cursor-pointer"
                >
                  {copiedCopyField === 'title' ? (
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy Title</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopySocialCopy('desc')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-extrabold cursor-pointer"
                >
                  {copiedCopyField === 'desc' ? (
                    <Check className="w-3.5 h-3.5 text-teal-200" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy Description &amp; Hashtags</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900">
              {socialCopy.title}
            </div>
            <pre className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-44 overflow-y-auto">
              {socialCopy.description}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
