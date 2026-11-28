import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { VisitedCountry, KnownLanguage, ClimateCategory, UserFinancialPortfolio } from '../types';
import {
  AVATAR_PRESETS,
  ALL_INTEREST_SUGGESTIONS,
  POPULAR_LANGUAGES,
  DEFAULT_FINANCIAL_PORTFOLIO,
  WORLD_COUNTRIES,
  getCountryCurrencyMacro,
  formatDualCurrency,
  getWorldCountryFlag,
} from '../data/userAccounts';
import { CurrencyAmountInput } from './CurrencyAmountInput';
import { CountryFlag } from './CountryFlag';
import {
  X, User, Image, Globe, Languages, Heart, Plus, Trash2,
  Check, Star, Sparkles, Upload, AlertCircle, Save, MapPin,
  DollarSign, Landmark, Coins, TrendingUp, ShieldCheck, Pencil
} from 'lucide-react';

export const EditProfileModal: React.FC = () => {
  const {
    isEditProfileOpen,
    setIsEditProfileOpen,
    editProfileInitialTab,
    userProfile,
    updateUserProfile,
    addVisitedCountry,
    removeVisitedCountry,
    addLanguage,
    removeLanguage,
    toggleInterest,
    countries,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'about' | 'picture' | 'finances' | 'travel' | 'languages' | 'interests'>('about');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Finances form state
  const [financesForm, setFinancesForm] = useState<UserFinancialPortfolio>(() => {
    return userProfile.finances || DEFAULT_FINANCIAL_PORTFOLIO;
  });
  const [salaryMode, setSalaryMode] = useState<'annual' | 'monthly'>('annual');

  // Form states initialized with current user profile
  const [formData, setFormData] = useState({
    name: userProfile.name,
    email: userProfile.email,
    avatarUrl: userProfile.avatarUrl || '',
    originCountry: userProfile.originCountry || 'United States',
    residingCountry: userProfile.residingCountry || userProfile.originCountry || 'United States',
    originCity: userProfile.originCity || '',
    targetCountry: userProfile.targetCountry || 'Portugal',
    retirementTimelineYear: userProfile.retirementTimelineYear || 2027,
    monthlyBudgetUSD: userProfile.monthlyBudgetUSD || 2500,
    preferredClimate: userProfile.preferredClimate || 'Mediterranean',
    relocationStatus: userProfile.relocationStatus || 'Scouting In-Person',
    occupationOrBackground: userProfile.occupationOrBackground || '',
    bio: userProfile.bio || '',
    aboutMe: userProfile.aboutMe || '',
  });

  const countryMacro = getCountryCurrencyMacro(formData.residingCountry || 'United States');
  const [inputCurrencyMode, setInputCurrencyMode] = useState<'LOCAL' | 'USD'>(() =>
    getCountryCurrencyMacro(userProfile.residingCountry || userProfile.originCountry || 'United States').currencyCode !== 'USD'
      ? 'LOCAL'
      : 'USD'
  );

  // Custom avatar URL input
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // New Visited Country Form
  const [isAddingCountry, setIsAddingCountry] = useState(false);
  const [newCountryName, setNewCountryName] = useState(countries[0]?.name || 'Portugal');
  const [newCountryCode, setNewCountryCode] = useState(countries[0]?.code || 'PT');
  const [newCountryFlag, setNewCountryFlag] = useState(countries[0]?.flag || '🇵🇹');
  const [newYearVisited, setNewYearVisited] = useState<number>(2023);
  const [newPurpose, setNewPurpose] = useState<VisitedCountry['purpose']>('Scouting Trip');
  const [newDuration, setNewDuration] = useState('2 weeks');
  const [newRating, setNewRating] = useState<number>(5);
  const [newWouldRetire, setNewWouldRetire] = useState<'Definitely' | 'Maybe' | 'Unlikely'>('Definitely');
  const [newFavoriteSpot, setNewFavoriteSpot] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // New Language Form
  const [newLangName, setNewLangName] = useState('Spanish');
  const [newLangProficiency, setNewLangProficiency] = useState<KnownLanguage['proficiency']>('Conversational');

  // New Custom Interest & Inline Editing
  const [customInterestInput, setCustomInterestInput] = useState('');
  const [editingInterest, setEditingInterest] = useState<string | null>(null);
  const [editingInterestValue, setEditingInterestValue] = useState('');
  const [interestNotice, setInterestNotice] = useState<string | null>(null);

  // Success indicator
  const [savedNotice, setSavedNotice] = useState(false);

  // Track modal open transition so internal userProfile updates don't reset activeTab or formData
  const wasModalOpenRef = React.useRef(false);
  const lastInitialTabRef = React.useRef(editProfileInitialTab);

  // Sync state when modal opens or initialTab changes
  useEffect(() => {
    if (isEditProfileOpen) {
      const justOpened = !wasModalOpenRef.current;
      const tabChanged = lastInitialTabRef.current !== editProfileInitialTab;

      if (justOpened || tabChanged) {
        const requestedTab = editProfileInitialTab || 'about';
        setActiveTab(requestedTab === 'picture' ? 'about' : requestedTab === 'interests' ? 'languages' : requestedTab);
        setShowAvatarPicker(requestedTab === 'picture');
        setFormData({
          name: userProfile.name,
          email: userProfile.email,
          avatarUrl: userProfile.avatarUrl || '',
          originCountry: userProfile.originCountry || 'United States',
          residingCountry: userProfile.residingCountry || userProfile.originCountry || 'United States',
          originCity: userProfile.originCity || '',
          targetCountry: userProfile.targetCountry || 'Portugal',
          retirementTimelineYear: userProfile.retirementTimelineYear || 2027,
          monthlyBudgetUSD: userProfile.monthlyBudgetUSD || 2500,
          preferredClimate: userProfile.preferredClimate || 'Mediterranean',
          relocationStatus: userProfile.relocationStatus || 'Scouting In-Person',
          occupationOrBackground: userProfile.occupationOrBackground || '',
          bio: userProfile.bio || '',
          aboutMe: userProfile.aboutMe || '',
        });
        setFinancesForm(userProfile.finances || DEFAULT_FINANCIAL_PORTFOLIO);
        const nextResiding = userProfile.residingCountry || userProfile.originCountry || 'United States';
        const macro = getCountryCurrencyMacro(nextResiding);
        setInputCurrencyMode(macro.currencyCode !== 'USD' ? 'LOCAL' : 'USD');
        setSavedNotice(false);
        setEditingInterest(null);
        setEditingInterestValue('');
        setInterestNotice(null);
      }

      wasModalOpenRef.current = true;
      lastInitialTabRef.current = editProfileInitialTab;
    } else {
      wasModalOpenRef.current = false;
    }
  }, [isEditProfileOpen, editProfileInitialTab, userProfile]);

  if (!isEditProfileOpen) return null;

  const handleCountrySelectionChange = (countryName: string) => {
    setNewCountryName(countryName);
    const matchedDossier = countries.find(c => c.name === countryName);
    const matchedWorld = WORLD_COUNTRIES.find(c => c.name === countryName);
    if (matchedDossier) {
      setNewCountryCode(matchedDossier.code);
      setNewCountryFlag(matchedDossier.flag);
    } else if (matchedWorld) {
      setNewCountryCode(matchedWorld.code);
      setNewCountryFlag(matchedWorld.flag);
    } else {
      setNewCountryCode('INTL');
      setNewCountryFlag('🌍');
    }
  };

  const handleAddVisitedCountrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryName.trim()) return;

    addVisitedCountry({
      countryName: newCountryName.trim(),
      countryCode: newCountryCode,
      flag: newCountryFlag,
      yearVisited: Number(newYearVisited),
      purpose: newPurpose,
      duration: newDuration.trim() || 'Scouting Stay',
      rating: newRating,
      wouldRetireHere: newWouldRetire,
      favoriteSpotOrMemory: newFavoriteSpot.trim() || 'Explored coastal towns and local markets.',
      notes: newNotes.trim() || 'Checked out local walkability, dining, and lifestyle pace.',
    });

    setIsAddingCountry(false);
    setNewFavoriteSpot('');
    setNewNotes('');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleAddLanguageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLangName.trim()) return;

    addLanguage({
      language: newLangName.trim(),
      proficiency: newLangProficiency,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const showTemporaryInterestNotice = (message: string) => {
    setInterestNotice(message);
    setTimeout(() => {
      setInterestNotice(prev => (prev === message ? null : prev));
    }, 3500);
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInterestInput.trim();
    if (!trimmed) return;

    const currentInterests = userProfile.interests || [];
    const existingExactOrCase = currentInterests.find(
      item => item.toLowerCase() === trimmed.toLowerCase()
    );

    if (existingExactOrCase) {
      setCustomInterestInput('');
      showTemporaryInterestNotice(`"${existingExactOrCase}" is already in your selected interests.`);
      return;
    }

    // Check if it matches a predefined suggestion case-insensitively
    const matchedPreset = ALL_INTEREST_SUGGESTIONS.find(
      preset => preset.toLowerCase() === trimmed.toLowerCase()
    );
    const interestToAdd = matchedPreset || trimmed;

    updateUserProfile({
      interests: [...currentInterests, interestToAdd],
    });
    setCustomInterestInput('');
    showTemporaryInterestNotice(`Added "${interestToAdd}" to your interests!`);
  };

  const handleStartEditInterest = (interest: string) => {
    setEditingInterest(interest);
    setEditingInterestValue(interest);
  };

  const handleCancelEditInterest = () => {
    setEditingInterest(null);
    setEditingInterestValue('');
  };

  const handleSaveEditedInterest = (oldInterest: string) => {
    const trimmedNew = editingInterestValue.trim();
    if (!trimmedNew || trimmedNew === oldInterest) {
      setEditingInterest(null);
      setEditingInterestValue('');
      return;
    }

    const currentInterests = userProfile.interests || [];
    const duplicate = currentInterests.find(
      item => item !== oldInterest && item.toLowerCase() === trimmedNew.toLowerCase()
    );

    let updatedInterests: string[];
    if (duplicate) {
      // Remove the old one since the renamed target already exists
      updatedInterests = currentInterests.filter(item => item !== oldInterest);
      showTemporaryInterestNotice(`Merged with existing interest "${duplicate}".`);
    } else {
      updatedInterests = currentInterests.map(item => (item === oldInterest ? trimmedNew : item));
      showTemporaryInterestNotice(`Updated interest to "${trimmedNew}".`);
    }

    updateUserProfile({ interests: updatedInterests });
    setEditingInterest(null);
    setEditingInterestValue('');
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    const currentInterests = userProfile.interests || [];
    updateUserProfile({
      interests: currentInterests.filter(item => item !== interestToRemove),
    });
    if (editingInterest === interestToRemove) {
      setEditingInterest(null);
      setEditingInterestValue('');
    }
    showTemporaryInterestNotice(`Removed "${interestToRemove}" from your interests.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = 200;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const minSide = Math.min(img.width, img.height);
            const sx = (img.width - minSide) / 2;
            const sy = (img.height - minSide) / 2;
            ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            setFormData(prev => ({ ...prev, avatarUrl: compressedDataUrl }));
            updateUserProfile({ avatarUrl: compressedDataUrl });
          } else {
            setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
            updateUserProfile({ avatarUrl: reader.result as string });
          }
          setAvatarError(null);
          setSavedNotice(true);
          setTimeout(() => setSavedNotice(false), 3000);
        };
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAboutChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim() || userProfile.name;
    updateUserProfile({
      ...formData,
      name: trimmedName,
      monthlyBudgetUSD: Math.round(Number(formData.monthlyBudgetUSD) || 2400),
    });
    setFormData(prev => ({ ...prev, name: trimmedName }));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleCloseModal = () => {
    const trimmedName = formData.name.trim();
    if (trimmedName) {
      updateUserProfile({
        ...formData,
        name: trimmedName,
        monthlyBudgetUSD: Math.round(Number(formData.monthlyBudgetUSD) || 2400),
      });
    }
    setIsEditProfileOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 310, damping: 28 }}
        className="relative overflow-hidden bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-indigo-200/80 flex flex-col max-h-[92vh] my-3"
      >
        {/* Top Multi-Color Gradient Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500 shrink-0" />

        {/* Compact Top Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-teal-50/70 via-indigo-50/50 to-amber-50/60 border-b border-indigo-100/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Expat Profile &amp; Travel Journal
              </h2>
              <p className="text-[11px] text-slate-600">
                Update your photo, relocation vision, financial ledger, visited countries, languages &amp; interests
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.08, rotate: 90 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleCloseModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* 4-Tab Non-Scrolling Grid Navigation (100% visible on desktop & mobile, zero horizontal scroll) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 px-5 py-2.5 bg-slate-50/90 border-b border-slate-200/80 text-xs font-bold shrink-0">
          {[
            {
              id: 'about',
              label: 'Profile & Photo',
              icon: User,
              activeClass: 'from-teal-600 to-indigo-600 text-white shadow-xs',
              isActive: activeTab === 'about' || activeTab === 'picture',
            },
            {
              id: 'finances',
              label: 'Financials & Assets',
              icon: DollarSign,
              activeClass: 'from-emerald-600 to-teal-600 text-white shadow-xs',
              isActive: activeTab === 'finances',
            },
            {
              id: 'travel',
              label: `Travel Log (${userProfile.travelHistory?.length || 0})`,
              icon: Globe,
              activeClass: 'from-amber-500 to-orange-600 text-white shadow-xs',
              isActive: activeTab === 'travel',
            },
            {
              id: 'languages',
              label: `Langs (${userProfile.languagesKnown?.length || 0}) & Interests (${userProfile.interests?.length || 0})`,
              icon: Languages,
              activeClass: 'from-violet-600 to-rose-600 text-white shadow-xs',
              isActive: activeTab === 'languages' || activeTab === 'interests',
            },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (formData.name.trim() && formData.name.trim() !== userProfile.name) {
                    updateUserProfile({
                      ...formData,
                      name: formData.name.trim(),
                      monthlyBudgetUSD: Math.round(Number(formData.monthlyBudgetUSD) || 2400),
                    });
                  }
                  setActiveTab(tab.id as any);
                }}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 truncate cursor-pointer ${
                  tab.isActive
                    ? `bg-gradient-to-r ${tab.activeClass}`
                    : 'text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Saved Toast notice */}
        {savedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-5 mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-2xs shrink-0"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile updates saved successfully!</span>
          </motion.div>
        )}

        {/* Tab Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: PROFILE, PHOTO & VISION (Unified & Compact) */}
          {(activeTab === 'about' || activeTab === 'picture') && (
            <form noValidate onSubmit={handleSaveAboutChanges} className="space-y-3.5">
              {/* Compact Inline Avatar & Photo Picker Bar */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {formData.avatarUrl ? (
                        <img
                          src={formData.avatarUrl}
                          alt={formData.name}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-teal-600/30 border-2 border-white shadow-2xs"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-teal-800 text-white text-lg font-bold flex items-center justify-center ring-2 ring-teal-600/30">
                          {formData.name.charAt(0)}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{formData.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {formData.relocationStatus} · Target: <strong className="text-teal-800">{formData.targetCountry}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Image className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{showAvatarPicker ? 'Hide Avatar Gallery' : 'Choose Avatar / URL'}</span>
                    </button>
                    <label className="cursor-pointer px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-teal-700" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {formData.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, avatarUrl: '' }));
                          updateUserProfile({ avatarUrl: '' });
                          setSavedNotice(true);
                          setTimeout(() => setSavedNotice(false), 3000);
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {avatarError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{avatarError}</span>
                  </div>
                )}

                {showAvatarPicker && (
                  <div className="pt-2.5 border-t border-slate-200/80 space-y-2.5 animate-in fade-in duration-150">
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {AVATAR_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, avatarUrl: preset.url }));
                            updateUserProfile({ avatarUrl: preset.url });
                            setSavedNotice(true);
                            setTimeout(() => setSavedNotice(false), 3000);
                          }}
                          className={`relative p-1 rounded-xl border text-center transition-all cursor-pointer ${
                            formData.avatarUrl === preset.url
                              ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-600'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                          title={preset.label}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-12 rounded-lg object-cover"
                          />
                          <span className="text-[9px] text-slate-600 font-medium mt-0.5 block truncate">
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Or paste custom image URL (https://...)"
                        value={customAvatarUrl}
                        onChange={e => setCustomAvatarUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!customAvatarUrl.trim()) return;
                          setFormData(prev => ({ ...prev, avatarUrl: customAvatarUrl.trim() }));
                          updateUserProfile({ avatarUrl: customAvatarUrl.trim() });
                          setCustomAvatarUrl('');
                          setSavedNotice(true);
                          setTimeout(() => setSavedNotice(false), 3000);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900 transition-colors cursor-pointer"
                      >
                        Apply URL
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Compact Row 1: Name, Email, Occupation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Occupation / Background
                  </label>
                  <input
                    type="text"
                    value={formData.occupationOrBackground}
                    onChange={e => setFormData({ ...formData, occupationOrBackground: e.target.value })}
                    placeholder="e.g. Architect, Engineer, Creator"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Compact Row 2: Origin, Residing, Home City, Relocation Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Origin / Nationality
                  </label>
                  <select
                    value={formData.originCountry}
                    onChange={e => setFormData({ ...formData, originCountry: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    {!WORLD_COUNTRIES.some(c => c.name === formData.originCountry) && formData.originCountry && (
                      <option value={formData.originCountry}>🌍 {formData.originCountry}</option>
                    )}
                    {WORLD_COUNTRIES.map(c => (
                      <option key={`origin-${c.code}-${c.name}`} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Residing Country
                  </label>
                  <select
                    value={formData.residingCountry}
                    onChange={e => setFormData({ ...formData, residingCountry: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    {!WORLD_COUNTRIES.some(c => c.name === formData.residingCountry) && formData.residingCountry && (
                      <option value={formData.residingCountry}>🌍 {formData.residingCountry}</option>
                    )}
                    {WORLD_COUNTRIES.map(c => (
                      <option key={`residing-${c.code}-${c.name}`} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Residing City
                  </label>
                  <input
                    type="text"
                    value={formData.originCity}
                    onChange={e => setFormData({ ...formData, originCity: e.target.value })}
                    placeholder="e.g. Austin, TX"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Relocation Status
                  </label>
                  <select
                    value={formData.relocationStatus}
                    onChange={e => setFormData({ ...formData, relocationStatus: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="Exploring Options">Exploring Options</option>
                    <option value="Scouting In-Person">Scouting In-Person</option>
                    <option value="Visa In-Progress">Visa In-Progress</option>
                    <option value="Relocated & Settled">Relocated & Settled</option>
                    <option value="Early Retired (FIRE)">Early Retired (FIRE)</option>
                  </select>
                </div>
              </div>

              {/* Compact Row 3: Target Haven, Departure Year, Monthly Budget, Climate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Target Haven Country
                  </label>
                  <select
                    value={formData.targetCountry}
                    onChange={e => setFormData({ ...formData, targetCountry: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    {countries.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Target Departure Year
                  </label>
                  <input
                    type="number"
                    min={2024}
                    max={2040}
                    value={formData.retirementTimelineYear}
                    onChange={e => setFormData({ ...formData, retirementTimelineYear: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Monthly Budget ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                    </label>
                    {countryMacro.currencyCode !== 'USD' && (
                      <button
                        type="button"
                        onClick={() => setInputCurrencyMode(prev => (prev === 'LOCAL' ? 'USD' : 'LOCAL'))}
                        className="text-[10px] font-bold text-orange-700 hover:underline cursor-pointer"
                      >
                        {inputCurrencyMode === 'LOCAL' ? '$ USD' : countryMacro.currencyCode}
                      </button>
                    )}
                  </div>
                  <CurrencyAmountInput
                    usdValue={formData.monthlyBudgetUSD || 2500}
                    onChangeUsd={(val) => setFormData({ ...formData, monthlyBudgetUSD: val })}
                    currencyMode={inputCurrencyMode}
                    countryMacro={countryMacro}
                    stepUsd={100}
                    inputSize="sm"
                    helperSuffix="/mo"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Preferred Climate
                  </label>
                  <select
                    value={formData.preferredClimate}
                    onChange={e => setFormData({ ...formData, preferredClimate: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="Mediterranean">Mediterranean</option>
                    <option value="Tropical">Tropical</option>
                    <option value="Subtropical">Subtropical</option>
                    <option value="Temperate">Temperate</option>
                    <option value="Highlands / Mild">Highlands / Eternal Spring</option>
                    <option value="Any">Any Climate</option>
                  </select>
                </div>
              </div>

              {/* Compact Row 4: Short Headline & Vision Bio side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Headline / Short Bio
                  </label>
                  <textarea
                    rows={2}
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="One-sentence summary for your profile card..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    About Me &amp; Retirement Vision
                  </label>
                  <textarea
                    rows={2}
                    value={formData.aboutMe}
                    onChange={e => setFormData({ ...formData, aboutMe: e.target.value })}
                    placeholder="What motivates you to relocate or retire abroad..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile &amp; Vision</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: SALARY & INVESTMENT SCHEMES (FINANCES) */}
          {activeTab === 'finances' && (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const roundUsd2 = (v: unknown) => Math.round((Number(v) || 0) * 100) / 100;
                const hasExplicitMonthly =
                  financesForm.monthlySalaryUSD !== undefined && financesForm.monthlySalaryUSD !== null;
                const cleanMonthly = hasExplicitMonthly
                  ? roundUsd2(Number(financesForm.monthlySalaryUSD) || 0)
                  : roundUsd2((Number(financesForm.currentSalaryUSD) || 0) / 12);
                const cleanAnnual = roundUsd2(
                  financesForm.currentSalaryUSD !== undefined && financesForm.currentSalaryUSD !== null
                    ? Number(financesForm.currentSalaryUSD) || 0
                    : cleanMonthly * 12
                );
                updateUserProfile({
                  residingCountry: formData.residingCountry,
                  finances: {
                    ...financesForm,
                    currentSalaryUSD: cleanAnnual,
                    monthlySalaryUSD: cleanMonthly,
                    monthlyCurrentExpensesUSD: roundUsd2(financesForm.monthlyCurrentExpensesUSD ?? 3200),
                    monthlySipUSD: roundUsd2(financesForm.monthlySipUSD ?? 0),
                    additionalMonthlyPassiveUSD: roundUsd2(financesForm.additionalMonthlyPassiveUSD || 0),
                    totalLiabilitiesUSD: roundUsd2(financesForm.totalLiabilitiesUSD || 0),
                    investments: {
                      savingsUSD: roundUsd2(financesForm.investments?.savingsUSD || 0),
                      stocksMutualFundsUSD: roundUsd2(financesForm.investments?.stocksMutualFundsUSD || 0),
                      realEstateUSD: roundUsd2(financesForm.investments?.realEstateUSD || 0),
                      goldUSD: roundUsd2(financesForm.investments?.goldUSD || 0),
                      othersUSD: roundUsd2(financesForm.investments?.othersUSD || 0),
                    },
                    updatedAt: new Date().toISOString().split('T')[0],
                  },
                });
                setSavedNotice(true);
                setTimeout(() => setSavedNotice(false), 3000);
              }}
              className="space-y-6"
            >
              <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Salary & Multi-Scheme Net Worth Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter your financial details in your <strong>Local Currency ({countryMacro.currencyCode})</strong> or <strong>$ USD</strong>. Totals auto-calculate live.
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Recalculate Financials</span>
                </button>
              </div>

              {/* UNIFORM RESIDING COUNTRY & LOCAL CURRENCY / USD INPUT TOGGLE BAR */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50/80 via-amber-50/50 to-purple-50/60 border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-orange-950 uppercase tracking-wider block mb-1">
                    Residing Country & Local Currency Basis
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={formData.residingCountry}
                      onChange={(e) => {
                        const next = e.target.value;
                        setFormData(prev => ({ ...prev, residingCountry: next }));
                        const nextMacro = getCountryCurrencyMacro(next);
                        setInputCurrencyMode(nextMacro.currencyCode !== 'USD' ? 'LOCAL' : 'USD');
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-orange-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {!WORLD_COUNTRIES.some(c => c.name === formData.residingCountry) && formData.residingCountry && (
                        <option value={formData.residingCountry}>🌍 {formData.residingCountry}</option>
                      )}
                      {WORLD_COUNTRIES.map(c => (
                        <option key={`prof-fin-country-${c.code}-${c.name}`} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-[11px] font-mono text-slate-600">
                      {countryMacro.currencyCode !== 'USD'
                        ? `1 USD = ${countryMacro.symbol.trim()}${countryMacro.rateToUSD} ${countryMacro.currencyCode}`
                        : 'Base Currency: $ USD'}
                    </span>
                  </div>
                </div>

                {countryMacro.currencyCode !== 'USD' && (
                  <div className="shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 sm:text-right">
                      Input Currency Mode
                    </span>
                    <div className="inline-flex rounded-xl border border-orange-300 p-0.5 bg-white shadow-2xs text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setInputCurrencyMode('LOCAL')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          inputCurrencyMode === 'LOCAL'
                            ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Input in {countryMacro.currencyCode} ({countryMacro.symbol.trim()})
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputCurrencyMode('USD')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          inputCurrencyMode === 'USD'
                            ? 'bg-slate-900 text-white font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Input in $ USD
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Salary Section (Both Annual and Monthly directly editable) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-teal-700" />
                    <span>
                      Current Income, Monthly Current Expenses, SIP & Liabilities ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? `${countryMacro.currencyCode} ${countryMacro.symbol.trim()}` : '$ USD'})
                    </span>
                  </h4>
                  <span className="text-[11px] text-teal-800 font-semibold">
                    Annual & Monthly auto-calculate each other
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Annual Salary ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                    </label>
                    <CurrencyAmountInput
                      usdValue={financesForm.currentSalaryUSD || 0}
                      onChangeUsd={(val) =>
                        setFinancesForm(prev => ({
                          ...prev,
                          currentSalaryUSD: val,
                          monthlySalaryUSD: Math.round((val / 12) * 100) / 100,
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      inputSize="sm"
                      helperSuffix="/yr"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Monthly Salary ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                    </label>
                    <CurrencyAmountInput
                      usdValue={financesForm.monthlySalaryUSD || Math.round((financesForm.currentSalaryUSD || 0) / 12)}
                      onChangeUsd={(val) =>
                        setFinancesForm(prev => ({
                          ...prev,
                          monthlySalaryUSD: val,
                          currentSalaryUSD: Math.round(val * 12 * 100) / 100,
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      inputSize="sm"
                      helperSuffix="/mo"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-rose-800 block mb-1">
                      Monthly Current Expenses ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                    </label>
                    <CurrencyAmountInput
                      usdValue={financesForm.monthlyCurrentExpensesUSD ?? 3200}
                      onChangeUsd={(val) =>
                        setFinancesForm(prev => ({
                          ...prev,
                          monthlyCurrentExpensesUSD: val,
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      stepUsd={50}
                      inputSize="sm"
                      helperSuffix="/mo"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Current household & living expenses (excluding loan EMIs & SIP)
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Additional Monthly Passive Income ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                    </label>
                    <CurrencyAmountInput
                      usdValue={financesForm.additionalMonthlyPassiveUSD || 0}
                      onChangeUsd={(val) =>
                        setFinancesForm(prev => ({
                          ...prev,
                          additionalMonthlyPassiveUSD: val,
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      stepUsd={50}
                      inputSize="sm"
                      helperSuffix="/mo"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Dividends, rental income, pensions, social security
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Monthly SIP Being Invested ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                    </label>
                    <CurrencyAmountInput
                      usdValue={financesForm.monthlySipUSD ?? 2800}
                      onChangeUsd={(val) =>
                        setFinancesForm(prev => ({
                          ...prev,
                          monthlySipUSD: val,
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      stepUsd={100}
                      inputSize="sm"
                      helperSuffix="/mo"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Systematic monthly investment feeding your FIRE Calculator
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Total Loan Liabilities Principal ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                    </label>
                    <CurrencyAmountInput
                      usdValue={financesForm.totalLiabilitiesUSD || 0}
                      onChangeUsd={(val) =>
                        setFinancesForm(prev => ({
                          ...prev,
                          totalLiabilitiesUSD: val,
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      stepUsd={1000}
                      inputSize="sm"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Combined mortgage, auto & personal loan balances
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 Investment Schemes */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-teal-700" />
                  <span>
                    5 Investment Asset Schemes ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? `Enter in ${countryMacro.currencyCode} ${countryMacro.symbol.trim()}` : 'Enter in $ USD'})
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Scheme 1: Savings */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>1. Savings & Cash Reserves ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})</span>
                    </label>
                    <CurrencyAmountInput
                      usdValue={financesForm.investments?.savingsUSD || 0}
                      onChangeUsd={(val) =>
                        setFinancesForm(prev => ({
                          ...prev,
                          investments: { ...prev.investments, savingsUSD: val },
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      stepUsd={1000}
                      inputSize="sm"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Emergency fund, high-yield cash, checking, fixed deposits / CDs
                    </span>
                  </div>

                  {/* Scheme 2: Stocks / Mutual Funds */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>2. Stocks & Mutual Funds / ETFs ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})</span>
                    </label>
                    <CurrencyAmountInput
                      usdValue={financesForm.investments?.stocksMutualFundsUSD || 0}
                      onChangeUsd={(val) =>
                        setFinancesForm(prev => ({
                          ...prev,
                          investments: { ...prev.investments, stocksMutualFundsUSD: val },
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      stepUsd={1000}
                      inputSize="sm"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Index funds, mutual funds, 401(k)/EPF/PPF, brokerage equities
                    </span>
                  </div>

                  {/* Scheme 3: Real Estate */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-teal-700" />
                      <span>3. Real Estate Equity & Land ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})</span>
                    </label>
                    <CurrencyAmountInput
                      usdValue={financesForm.investments?.realEstateUSD || 0}
                      onChangeUsd={(val) =>
                        setFinancesForm(prev => ({
                          ...prev,
                          investments: { ...prev.investments, realEstateUSD: val },
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      stepUsd={5000}
                      inputSize="sm"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Home equity, rental properties, REITs (net equity)
                    </span>
                  </div>

                  {/* Scheme 4: Gold */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>4. Gold & Precious Metals ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})</span>
                    </label>
                    <CurrencyAmountInput
                      usdValue={financesForm.investments?.goldUSD || 0}
                      onChangeUsd={(val) =>
                        setFinancesForm(prev => ({
                          ...prev,
                          investments: { ...prev.investments, goldUSD: val },
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      stepUsd={1000}
                      inputSize="sm"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Physical bullion, Sovereign Gold Bonds (SGB), silver
                    </span>
                  </div>

                  {/* Scheme 5: Others */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>5. Other Investments & Alternatives ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})</span>
                    </label>
                    <CurrencyAmountInput
                      usdValue={financesForm.investments?.othersUSD || 0}
                      onChangeUsd={(val) =>
                        setFinancesForm(prev => ({
                          ...prev,
                          investments: { ...prev.investments, othersUSD: val },
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      stepUsd={1000}
                      inputSize="sm"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Crypto, corporate/gov bonds, private business equity, alternatives
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Worth Summary Preview (Dual-Currency) */}
              <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-teal-800 font-semibold block">Total Net Worth (Net of Debt):</span>
                  <div className="text-xl font-extrabold font-mono text-teal-950 mt-0.5">
                    {formatDualCurrency(
                      (financesForm.investments?.savingsUSD || 0) +
                        (financesForm.investments?.stocksMutualFundsUSD || 0) +
                        (financesForm.investments?.realEstateUSD || 0) +
                        (financesForm.investments?.goldUSD || 0) +
                        (financesForm.investments?.othersUSD || 0) -
                        (financesForm.totalLiabilitiesUSD || 0),
                      countryMacro,
                      true
                    )}
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs text-slate-500 block">4% SWR Monthly Cash Flow:</span>
                  <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">
                    {formatDualCurrency(
                      Math.round(
                        (((financesForm.investments?.savingsUSD || 0) +
                          (financesForm.investments?.stocksMutualFundsUSD || 0) +
                          (financesForm.investments?.realEstateUSD || 0) +
                          (financesForm.investments?.goldUSD || 0) +
                          (financesForm.investments?.othersUSD || 0) -
                          (financesForm.totalLiabilitiesUSD || 0)) *
                          0.04) /
                          12
                      ),
                      countryMacro,
                      false
                    )}/mo
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Recalculate Financial Portfolio</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: TRAVEL HISTORY (COUNTRIES VISITED) */}
          {activeTab === 'travel' && (
            <div className="space-y-6">
              
              {/* Header and Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Logged Countries Visited ({userProfile.travelHistory?.length || 0})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track your past trips, scouting expeditions, and retirement suitability ratings.
                  </p>
                </div>

                {!isAddingCountry && (
                  <button
                    type="button"
                    onClick={() => setIsAddingCountry(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900 transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Visited Country</span>
                  </button>
                )}
              </div>

              {/* Add New Visited Country Form */}
              {isAddingCountry && (
                <form onSubmit={handleAddVisitedCountrySubmit} className="p-4 rounded-xl border border-teal-200 bg-teal-50/30 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                      <span>Log a New Country Visited</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingCountry(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Country
                      </label>
                      <select
                        value={newCountryName}
                        onChange={e => handleCountrySelectionChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        {WORLD_COUNTRIES.map(c => (
                          <option key={`travel-${c.code}-${c.name}`} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Year Visited
                      </label>
                      <input
                        type="number"
                        min={1970}
                        max={2026}
                        value={newYearVisited}
                        onChange={e => setNewYearVisited(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Stay Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2 weeks, 1 month"
                        value={newDuration}
                        onChange={e => setNewDuration(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Travel Purpose
                      </label>
                      <select
                        value={newPurpose}
                        onChange={e => setNewPurpose(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        <option value="Scouting Trip">Scouting Trip</option>
                        <option value="Vacation & Tourism">Vacation & Tourism</option>
                        <option value="Expat Residency">Expat Residency</option>
                        <option value="Digital Nomad Stay">Digital Nomad Stay</option>
                        <option value="Work / Relocation">Work / Relocation</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Experience Rating (1–5 Stars)
                      </label>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= newRating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Would Consider Retiring Here?
                      </label>
                      <select
                        value={newWouldRetire}
                        onChange={e => setNewWouldRetire(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        <option value="Definitely">Definitely Yes</option>
                        <option value="Maybe">Maybe / Under Evaluation</option>
                        <option value="Unlikely">Unlikely / Not for Me</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Favorite City or Memory
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cascais promenade, Olhão seafood market, Chiang Mai Nimman cafés..."
                      value={newFavoriteSpot}
                      onChange={e => setNewFavoriteSpot(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Expat Insights & Practical Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Notes on cost, walkability, hospitals, language friendliness, or residency hurdles..."
                      value={newNotes}
                      onChange={e => setNewNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCountry(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900 transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Country to History</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Visited Countries List */}
              <div className="space-y-3">
                {(!userProfile.travelHistory || userProfile.travelHistory.length === 0) ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                    <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-600 font-medium">No visited countries added yet.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Log your scouting trips to see how your experiences inform your retirement choice!
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddingCountry(true)}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-teal-800 text-white text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Country</span>
                    </button>
                  </div>
                ) : (
                  userProfile.travelHistory.map(item => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <CountryFlag
                          countryCode={item.countryCode}
                          countryName={item.countryName}
                          fallbackEmoji={item.flag}
                          size="lg"
                          className="w-7 h-5 rounded-xs shrink-0 mt-0.5"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{item.countryName}</h4>
                            <span className="text-xs font-mono text-slate-500 font-medium">
                              {item.yearVisited} ({item.duration || 'Stay'})
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                              {item.purpose}
                            </span>
                            {item.wouldRetireHere && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                item.wouldRetireHere === 'Definitely'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : item.wouldRetireHere === 'Maybe'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                Retire: {item.wouldRetireHere}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 my-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= item.rating
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>

                          {item.favoriteSpotOrMemory && (
                            <p className="text-xs text-slate-700 font-medium mt-1">
                              "{item.favoriteSpotOrMemory}"
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeVisitedCountry(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 self-end sm:self-auto"
                        title="Remove country"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LANGUAGES KNOWN & LIFESTYLE INTERESTS (UNIFIED) */}
          {(activeTab === 'languages' || activeTab === 'interests') && (
            <div className="space-y-5">
              {/* SECTION A: LANGUAGES KNOWN */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Languages className="w-4 h-4 text-teal-700" />
                      <span>Languages Known ({userProfile.languagesKnown?.length || 0})</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Spoken languages unlock Polyglot badges and improve local integration scores.
                    </p>
                  </div>
                </div>

                {/* Add Language Form */}
                <form onSubmit={handleAddLanguageSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <select
                    value={newLangName}
                    onChange={e => setNewLangName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {POPULAR_LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>

                  <select
                    value={newLangProficiency}
                    onChange={e => setNewLangProficiency(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Native">Native / Mother Tongue</option>
                    <option value="Fluent">Fluent (C1-C2)</option>
                    <option value="Conversational">Conversational (B1-B2)</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Beginner / Learning">Beginner / Learning</option>
                  </select>

                  <button
                    type="submit"
                    className="w-full py-1.5 px-3 rounded-lg bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Language</span>
                  </button>
                </form>

                {/* Current Languages Pills */}
                {(!userProfile.languagesKnown || userProfile.languagesKnown.length === 0) ? (
                  <p className="text-xs text-slate-400 py-2">No languages added yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userProfile.languagesKnown.map(lang => (
                      <div
                        key={lang.id}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white flex items-center gap-2 shadow-2xs text-xs"
                      >
                        <span className="font-bold text-slate-900">{lang.language}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          lang.proficiency === 'Native'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : lang.proficiency === 'Fluent'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : lang.proficiency === 'Conversational'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {lang.proficiency}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLanguage(lang.id)}
                          className="p-0.5 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove language"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION B: INTERESTS & HOBBIES */}
              {(() => {
                const currentInterests = userProfile.interests || [];
                const customInterests = currentInterests.filter(
                  interest => !ALL_INTEREST_SUGGESTIONS.includes(interest)
                );

                return (
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Heart className="w-4 h-4 text-rose-600" />
                          <span>Lifestyle &amp; Retirement Interests ({currentInterests.length})</span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Select curated priorities or add your own custom hobbies.
                        </p>
                      </div>
                      {customInterests.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[10px] font-bold text-rose-800 self-start sm:self-auto">
                          <Sparkles className="w-3 h-3 text-rose-600" />
                          <span>{customInterests.length} Custom</span>
                        </span>
                      )}
                    </div>

                    {interestNotice && (
                      <div className="p-2 px-3 rounded-xl bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-900 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>{interestNotice}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setInterestNotice(null)}
                          className="text-teal-600 hover:text-teal-900 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Add Custom Interest Form */}
                    <form onSubmit={handleAddCustomInterest} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Add custom interest (e.g. Scuba diving, Woodworking, Pickleball)..."
                        value={customInterestInput}
                        onChange={e => setCustomInterestInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        type="submit"
                        disabled={!customInterestInput.trim()}
                        className="px-4 py-1.5 rounded-xl bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Hobby</span>
                      </button>
                    </form>

                    {/* Active Interests Chips */}
                    {currentInterests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {currentInterests.map(interest => {
                          const isCustom = !ALL_INTEREST_SUGGESTIONS.includes(interest);
                          const isEditingThis = editingInterest === interest;

                          if (isEditingThis) {
                            return (
                              <div
                                key={`edit-${interest}`}
                                className="flex items-center gap-1.5 p-1 pl-2.5 rounded-xl border-2 border-teal-600 bg-white shadow-sm"
                              >
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingInterestValue}
                                  onChange={e => setEditingInterestValue(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSaveEditedInterest(interest);
                                    } else if (e.key === 'Escape') {
                                      handleCancelEditInterest();
                                    }
                                  }}
                                  className="text-xs font-semibold text-slate-900 bg-transparent focus:outline-none min-w-[120px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditedInterest(interest)}
                                  className="px-2 py-0.5 rounded-lg bg-teal-700 text-white text-[10px] font-bold hover:bg-teal-800 cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEditInterest}
                                  className="p-0.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={`active-${interest}`}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold shadow-2xs ${
                                isCustom
                                  ? 'bg-gradient-to-r from-indigo-50 to-teal-50 text-slate-900 border border-teal-300'
                                  : 'bg-white text-slate-800 border border-slate-200'
                              }`}
                            >
                              <span>{interest}</span>
                              <button
                                type="button"
                                onClick={() => handleStartEditInterest(interest)}
                                className="p-0.5 rounded text-slate-400 hover:text-teal-700 cursor-pointer"
                                title={`Edit "${interest}"`}
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveInterest(interest)}
                                className="p-0.5 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                                title={`Delete "${interest}"`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Curated Tag Cloud */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Quick-Toggle Curated Suggestions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_INTEREST_SUGGESTIONS.map(interest => {
                          const isSelected = currentInterests.includes(interest);
                          return (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => toggleInterest(interest)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? 'bg-teal-800 text-white shadow-2xs'
                                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              {isSelected ? (
                                <Check className="w-3 h-3 text-teal-300" />
                              ) : (
                                <Plus className="w-3 h-3 text-slate-400" />
                              )}
                              <span>{interest}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-indigo-100/80 bg-gradient-to-r from-slate-50 via-indigo-50/35 to-teal-50/40 rounded-b-3xl flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500">
            Changes are saved to your active ReFIREly profile.
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleCloseModal}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 text-white font-bold text-xs hover:from-teal-700 hover:to-violet-700 transition-all shadow-sm cursor-pointer"
          >
            Done
          </motion.button>
        </div>

      </motion.div>
    </motion.div>
  );
};
