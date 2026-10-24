import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  CheckCircle2,
  FileCode2,
  Image as ImageIcon,
  Layers,
  Share2,
  Award,
  Plane,
  Globe,
} from 'lucide-react';
import {
  BRAND_ASSET_CONFIGS,
  BrandAssetVariant,
  downloadBrandPng,
  downloadBrandSvg,
  downloadOriginalClassicLogo,
  generateBrandSvgString,
} from '../utils/exportBrandLogo';
import { BrandLogo } from './BrandLogo';

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterMode = 'all' | 'dotcom' | 'standard';

export const BrandKitModal: React.FC<BrandKitModalProps> = ({ isOpen, onClose }) => {
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [downloadedKeys, setDownloadedKeys] = useState<Record<string, boolean>>({});
  const [batchDownloading, setBatchDownloading] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  if (!isOpen) return null;

  const markDownloaded = (key: string) => {
    setDownloadedKeys((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setDownloadedKeys((prev) => ({ ...prev, [key]: false }));
    }, 3500);
  };

  const handleDownloadPng = async (variant: BrandAssetVariant) => {
    const key = `${variant}-png`;
    setDownloadingKey(key);
    try {
      await downloadBrandPng(variant, 1);
      markDownloaded(key);
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleDownloadSvg = (variant: BrandAssetVariant) => {
    const key = `${variant}-svg`;
    setDownloadingKey(key);
    try {
      downloadBrandSvg(variant);
      markDownloaded(key);
    } finally {
      setDownloadingKey(null);
    }
  };

  const filteredAssets = BRAND_ASSET_CONFIGS.filter((asset) => {
    if (filterMode === 'dotcom') return asset.hasDotCom || asset.id === 'square-emblem';
    if (filterMode === 'standard') return !asset.hasDotCom;
    return true;
  });

  const handleDownloadAllPngs = async () => {
    setBatchDownloading(true);
    try {
      for (const item of filteredAssets) {
        await downloadBrandPng(item.id, 1);
        await new Promise((r) => setTimeout(r, 320));
      }
      markDownloaded('batch-all');
    } finally {
      setBatchDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
          >
            {/* Top Multi-Colored Spectrum Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-teal-500 via-indigo-500 via-50% to-amber-500 shrink-0" />

            {/* Modal Header */}
            <div className="px-6 py-5 sm:px-8 sm:py-6 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 border-b border-indigo-900/60">
              <div className="flex items-center gap-4">
                <BrandLogo variant="icon" size="lg" />
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-300">
                    <Plane className="w-3.5 h-3.5 text-amber-400" />
                    <span>Authentic Flight &amp; Globe Flight-Path Emblem</span>
                    <span aria-hidden="true">·</span>
                    <span>ReFIREly &amp; ReFIREly.com (4K Ultra-HD)</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-0.5">
                    ReFIREly High-Resolution Brand &amp; Logo Kit
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    Featuring the true commercial passenger jet, curved arrow flight path &amp; globe cradle, plus both{' '}
                    <span className="text-white font-semibold">ReFIREly.com</span> (with smaller{' '}
                    <span className="text-teal-300 font-mono">.com</span>) and standard{' '}
                    <span className="text-white font-semibold">ReFIREly</span> editions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                <button
                  onClick={handleDownloadAllPngs}
                  disabled={batchDownloading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-300 via-teal-300 to-cyan-300 hover:from-amber-200 hover:to-cyan-200 transition-all shadow-md cursor-pointer disabled:opacity-60"
                >
                  {downloadedKeys['batch-all'] ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-900" />
                      <span>All {filteredAssets.length} High-Res PNGs Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      <span>
                        {batchDownloading
                          ? 'Exporting 4K Pack...'
                          : `Download All ${filteredAssets.length} PNGs`}
                      </span>
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close Brand Kit Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-gradient-to-b from-slate-50 via-white to-indigo-50/20">
              {/* Quick Primary 1-Click Hero Download Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50/90 via-indigo-50/80 to-amber-50/90 border border-indigo-200/80 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Updated High-Precision Flight &amp; Flight-Path Vector Master</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Instant 4K Download — Choose <span className="text-indigo-700">ReFIREly.com</span> (smaller .com) or <span className="text-teal-700">ReFIREly</span>
                  </h3>
                  <p className="text-xs text-slate-600 max-w-2xl">
                    Both editions include the corrected commercial passenger jet silhouette, curved arrow flight path with globe meridian ribs, 5-leaflet palm frond, and 3-tongue FIRE flame at 4096 × 1400 px.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full xl:w-auto">
                  <button
                    onClick={() => handleDownloadPng('horizontal-dotcom-transparent')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 shadow-sm transition-all cursor-pointer"
                  >
                    {downloadedKeys['horizontal-dotcom-transparent-png'] ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Saved ReFIREly.com 4K PNG!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download 4K ReFIREly.com PNG</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownloadPng('horizontal-transparent')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-900 bg-white hover:bg-indigo-50 border border-indigo-200 shadow-2xs transition-all cursor-pointer"
                  >
                    {downloadedKeys['horizontal-transparent-png'] ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Saved ReFIREly 4K PNG!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-indigo-600" />
                        <span>Download 4K ReFIREly PNG</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownloadSvg('horizontal-dotcom-transparent')}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-indigo-950 bg-indigo-100/80 hover:bg-indigo-200/70 border border-indigo-200 transition-all cursor-pointer"
                  >
                    {downloadedKeys['horizontal-dotcom-transparent-svg'] ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Saved .com SVG!</span>
                      </>
                    ) : (
                      <>
                        <FileCode2 className="w-4 h-4 text-indigo-700" />
                        <span>ReFIREly.com SVG</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Edition Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Filter Brand Editions:</span>
                </div>
                <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 self-start">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterMode === 'all'
                        ? 'bg-white text-indigo-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All 8 High-Res Assets
                  </button>
                  <button
                    onClick={() => setFilterMode('dotcom')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterMode === 'dotcom'
                        ? 'bg-white text-indigo-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    With .com (Smaller .com)
                  </button>
                  <button
                    onClick={() => setFilterMode('standard')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterMode === 'standard'
                        ? 'bg-white text-indigo-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Without .com
                  </button>
                </div>
              </div>

              {/* Grid of High-Res Brand Assets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAssets.map((asset, index) => {
                  const pngKey = `${asset.id}-png`;
                  const svgKey = `${asset.id}-svg`;
                  const isPngDownloaded = downloadedKeys[pngKey];
                  const isSvgDownloaded = downloadedKeys[svgKey];
                  const isPngLoading = downloadingKey === pngKey;
                  const svgMarkup = generateBrandSvgString(asset.id);

                  return (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`group rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md hover:border-indigo-300 transition-all overflow-hidden flex flex-col ${
                        asset.id === 'social-promo-banner' ? 'md:col-span-2' : ''
                      }`}
                    >
                      {/* Live Vector Preview Stage */}
                      <div
                        className={`relative w-full ${
                          asset.id === 'social-promo-banner' ? 'h-64 sm:h-80' : 'h-48 sm:h-52'
                        } ${asset.previewBgClass} flex items-center justify-center p-4 sm:p-6 border-b border-slate-100 overflow-hidden`}
                      >
                        <div
                          className="w-full h-full flex items-center justify-center [&>svg]:w-auto [&>svg]:h-full [&>svg]:max-w-full [&>svg]:object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-[1.03]"
                          dangerouslySetInnerHTML={{ __html: svgMarkup }}
                        />

                        {/* Top-Left .com Indicator if applicable */}
                        {asset.hasDotCom && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-indigo-950/80 backdrop-blur-xs text-[11px] font-bold text-teal-300 border border-teal-400/30">
                            Includes smaller .com
                          </div>
                        )}

                        {/* Quiet Top-Right Dimension Caption */}
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/75 backdrop-blur-xs text-[11px] font-mono font-semibold text-white">
                          {asset.dimensionsLabel}
                        </div>
                      </div>

                      {/* Asset Info & Download Controls */}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                            {asset.badgeText}
                          </div>
                          <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                            {asset.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {asset.subtitle}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleDownloadPng(asset.id)}
                            disabled={isPngLoading}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-indigo-700 hover:via-violet-700 hover:to-teal-700 transition-all shadow-2xs cursor-pointer"
                          >
                            {isPngDownloaded ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Downloaded PNG!</span>
                              </>
                            ) : (
                              <>
                                <ImageIcon className="w-3.5 h-3.5 text-teal-300" />
                                <span>
                                  {isPngLoading
                                    ? 'Rendering...'
                                    : `Download High-Res PNG (${asset.width}×${asset.height})`}
                                </span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDownloadSvg(asset.id)}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-900 bg-slate-100 hover:bg-indigo-50 border border-slate-200/80 transition-colors cursor-pointer"
                            title="Download infinite-resolution scalable vector SVG"
                          >
                            {isSvgDownloaded ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Saved SVG</span>
                              </>
                            ) : (
                              <>
                                <FileCode2 className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Vector .SVG</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Classic Heritage Logo Archive Row */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src="/assets/aistudio/refirely-logo.png"
                    alt="ReFIREly Classic Emblem"
                    className="h-12 w-auto object-contain rounded-lg bg-white p-1 border border-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Original Reference Raster Logo (641 × 240 px Source)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Compare side-by-side with the regenerated 4K masters above or download the original reference PNG.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    downloadOriginalClassicLogo();
                    markDownloaded('classic-png');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors cursor-pointer shrink-0"
                >
                  {downloadedKeys['classic-png'] ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Downloaded Original PNG</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Download Original PNG</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
              <div className="flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  All 8 ReFIREly &amp; ReFIREly.com brand marks are rendered at 300+ DPI print quality with sRGB color profiles.
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg font-bold text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
