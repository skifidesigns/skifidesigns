import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';
import { toast } from 'sonner';
import {
  UploadCloud, ImageIcon, Loader2, ArrowLeft, Layers, Plus, X, Download, ChevronRight,
  Sun, Moon,
} from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../context/AuthContext';
import { AILabSignInGate } from './AILabSignInGate';
import { trackEvent } from '../utils/analytics';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LogoSlot = ({ logo, onPick, onRemove, label, testid }) => {
  const ref = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const preview = logo ? URL.createObjectURL(logo) : null;
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onPick(e.dataTransfer.files?.[0]); }}
      onClick={() => !logo && ref.current?.click()}
      className={`relative rounded-xl border-2 border-dashed transition-colors ${
        dragOver ? 'border-[#2A7AFE] bg-[#2A7AFE]/5' : logo ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border hover:border-muted-foreground cursor-pointer'
      } aspect-[3/2] flex items-center justify-center p-4`}
      data-testid={testid}
    >
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
      {logo ? (
        <>
          <img src={preview} alt={label} className="max-h-full max-w-full object-contain" />
          <button
            type="button" onClick={onRemove}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <div className="text-center">
          <ImageIcon className="w-7 h-7 mx-auto text-muted-foreground mb-2" />
          <div className="text-xs font-semibold text-foreground">{label}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, SVG</div>
        </div>
      )}
    </div>
  );
};

const ColorChip = ({ label, value, onChange, testid }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return (
    <div className="relative" ref={ref} data-testid={testid}>
      <button
        type="button" onClick={() => setOpen((o) => !o)}
        className="w-full bg-card border border-border rounded-xl p-3 flex items-center gap-3 hover:border-muted-foreground transition-colors"
      >
        <div className="w-9 h-9 rounded-lg border border-border shadow-inner" style={{ backgroundColor: value }} />
        <div className="flex-1 text-left">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="text-sm font-mono tabular-nums text-foreground">{value}</div>
        </div>
      </button>
      {open && (
        <div className="absolute z-30 mt-2 p-3 bg-card border border-border rounded-xl shadow-xl">
          <HexColorPicker color={value} onChange={onChange} />
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 font-mono" />
        </div>
      )}
    </div>
  );
};

export const AITemplateGenerator = () => {
  const { user } = useAuth();
  const [logo1, setLogo1] = useState(null);
  const [logo2, setLogo2] = useState(null);
  const [coBranded, setCoBranded] = useState(false);
  const [palette, setPalette] = useState([]);
  const [primary, setPrimary] = useState('#2A7AFE');
  const [dark, setDark] = useState('#0A0F1E');
  const [light, setLight] = useState('#F5F4EE');
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const [company, setCompany] = useState('');
  const [projectName, setProjectName] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Auto-extract palette from logo1 whenever it changes
  useEffect(() => {
    if (!logo1) { setPalette([]); return; }
    let cancelled = false;
    (async () => {
      setExtracting(true);
      try {
        const fd = new FormData();
        fd.append('logo', logo1);
        const { data } = await axios.post(`${API}/ai-lab/template/extract-palette`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (cancelled) return;
        setPalette(data.palette || []);
        if (data.primary) setPrimary(data.primary);
      } catch (err) {
        if (!cancelled) toast.error('Could not extract palette - using defaults');
      } finally {
        if (!cancelled) setExtracting(false);
      }
    })();
    return () => { cancelled = true; };
  }, [logo1]);

  const validatePick = (f) => {
    if (!f) return null;
    if (!f.type.startsWith('image/')) { toast.error('Please choose an image (PNG/JPG/SVG)'); return null; }
    if (f.size > 8 * 1024 * 1024) { toast.error('Image larger than 8 MB'); return null; }
    return f;
  };

  const onGenerate = async () => {
    if (!logo1) return toast.error('Drop your primary logo first');
    setGenerating(true);
    trackEvent('ai_lab_template_started', { co_branded: coBranded && !!logo2, theme });
    try {
      const fd = new FormData();
      fd.append('company', company);
      fd.append('project_name', projectName || 'Your Brand');
      fd.append('primary', primary); fd.append('dark', dark); fd.append('light', light);
      fd.append('theme', theme);
      fd.append('logo1', logo1);
      if (coBranded && logo2) fd.append('logo2', logo2);

      const res = await axios.post(`${API}/ai-lab/template/generate`, fd, {
        responseType: 'blob',
        withCredentials: true,
        timeout: 60000,
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      const fn = (projectName || 'YourBrand').replace(/[^A-Za-z0-9_-]+/g, '_');
      a.href = url; a.download = `SkiFi-${fn}-${theme === 'light' ? 'Light' : 'Dark'}-Template.pptx`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      trackEvent('ai_lab_template_completed', { co_branded: coBranded && !!logo2, theme });
      toast.success('Template downloaded - open it in PowerPoint or Keynote');
    } catch (err) {
      let detail = 'Generation failed - please try again';
      if (err?.response?.data instanceof Blob) {
        try { detail = JSON.parse(await err.response.data.text()).detail || detail; } catch {}
      } else detail = err?.response?.data?.detail || detail;
      toast.error(detail);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <Link to="/ai-lab" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to AI Lab
          </Link>
          <div className="mb-8 sm:mb-12 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2A7AFE]/10 text-[#2A7AFE] text-xs font-semibold tracking-wider uppercase mb-5">
              <Layers className="w-3.5 h-3.5" /> Free &middot; Logo → Branded Template
            </div>
            <h1 className="font-display text-[34px] sm:text-[48px] lg:text-[56px] font-semibold leading-[1.05] tracking-tight text-foreground mb-4">
              Brand-ready slides, instantly.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Drop one logo (or two for co-branded decks). We pull your colors, you tweak them, and we ship a 5-slide editable PowerPoint.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-8" data-testid="template-form">
            <AILabSignInGate toolLabel="Logo → Branded Template">
            {/* Logos */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{coBranded ? 'Co-branded logos' : 'Your logo'}</h3>
                <button
                  type="button" onClick={() => { setCoBranded((v) => !v); if (coBranded) setLogo2(null); }}
                  data-testid="toggle-cobranded"
                  className="text-xs font-semibold text-[#2A7AFE] hover:underline inline-flex items-center gap-1"
                >
                  {coBranded ? (<><X className="w-3.5 h-3.5" /> Single-logo mode</>) : (<><Plus className="w-3.5 h-3.5" /> Add 2nd logo for co-brand</>)}
                </button>
              </div>
              <div className={`grid gap-4 ${coBranded ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                <LogoSlot logo={logo1} onPick={(f) => { const v = validatePick(f); if (v) setLogo1(v); }} onRemove={() => setLogo1(null)} label="Primary logo" testid="logo-slot-1" />
                {coBranded && (
                  <LogoSlot logo={logo2} onPick={(f) => { const v = validatePick(f); if (v) setLogo2(v); }} onRemove={() => setLogo2(null)} label="Partner logo" testid="logo-slot-2" />
                )}
              </div>
            </div>

            {/* Theme picker */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Template style</h3>
              <div className="grid grid-cols-2 gap-3" data-testid="theme-picker">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  data-testid="theme-dark"
                  className={`group relative rounded-xl border-2 p-4 text-left transition-all ${
                    theme === 'dark'
                      ? 'border-[#2A7AFE] shadow-[0_0_0_4px_rgba(42,122,254,0.12)]'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="aspect-[16/9] rounded-md mb-3 relative overflow-hidden" style={{ background: dark }}>
                    <div className="absolute bottom-2 left-2 right-8">
                      <div className="h-0.5 w-6 mb-1.5 rounded" style={{ background: primary }} />
                      <div className="h-2 w-3/4 mb-1 rounded bg-white/90" />
                      <div className="h-1 w-1/2 rounded bg-white/40" />
                    </div>
                    <div className="absolute top-2 right-2 h-2 w-4 rounded-sm bg-white/30" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-foreground" />
                    <div className="font-semibold text-sm text-foreground">Dark theme</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Bold investor-style title + closing</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  data-testid="theme-light"
                  className={`group relative rounded-xl border-2 p-4 text-left transition-all ${
                    theme === 'light'
                      ? 'border-[#2A7AFE] shadow-[0_0_0_4px_rgba(42,122,254,0.12)]'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="aspect-[16/9] rounded-md mb-3 relative overflow-hidden border border-border" style={{ background: light }}>
                    <div className="absolute bottom-2 left-2 right-8">
                      <div className="h-0.5 w-6 mb-1.5 rounded" style={{ background: primary }} />
                      <div className="h-2 w-3/4 mb-1 rounded bg-foreground/90" />
                      <div className="h-1 w-1/2 rounded bg-foreground/40" />
                    </div>
                    <div className="absolute top-2 right-2 h-2 w-4 rounded-sm" style={{ background: 'rgba(0,0,0,0.15)' }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-foreground" />
                    <div className="font-semibold text-sm text-foreground">Light theme</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Editorial / clean / minimal</div>
                </button>
              </div>
            </div>

            {/* Palette */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Brand palette</h3>
                {extracting && <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Reading colors&hellip;</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ColorChip label="Primary / Accent" value={primary} onChange={setPrimary} testid="color-primary" />
                <ColorChip label="Dark / Background" value={dark} onChange={setDark} testid="color-dark" />
                <ColorChip label="Light / Surface" value={light} onChange={setLight} testid="color-light" />
              </div>
              {palette.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground self-center">Suggested</span>
                  {palette.map((hex) => (
                    <button key={hex} type="button" onClick={() => setPrimary(hex)} className="w-7 h-7 rounded-full border-2 border-border hover:scale-110 transition-transform" style={{ backgroundColor: hex }} title={`Use ${hex} as primary`} />
                  ))}
                </div>
              )}
            </div>

            {/* Lead capture - now only project name + company; identity comes from Google */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3" data-testid="tpl-signed-in-as">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#2A7AFE] text-white text-xs font-semibold flex items-center justify-center">
                    {(user?.name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-foreground">{user?.name || user?.email}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input data-testid="tpl-input-project" placeholder="Project name (e.g. Acme Ventures)" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                <Input data-testid="tpl-input-company" placeholder="Company (optional)" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
            </div>

            <Button
              type="button" onClick={onGenerate} disabled={generating || !logo1}
              data-testid="tpl-generate-btn"
              className="w-full bg-[#2A7AFE] hover:bg-[#3B82F6] text-white font-semibold py-6 text-base"
            >
              {generating ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating&hellip;</>)
                : (<><Download className="w-5 h-5 mr-2" /> Download my .pptx template <ChevronRight className="w-5 h-5 ml-1" /></>)}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              5 editable slides: title, agenda, content, traction, closing.
            </p>
            </AILabSignInGate>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};
