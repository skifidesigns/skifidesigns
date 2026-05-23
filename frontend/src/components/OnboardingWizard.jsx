import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PROJECT_TYPES = [
  'Pitch Deck',
  'Sales Deck',
  'Corporate Presentation',
  'Investor Deck',
  'Webinar / Keynote',
  'Infographic',
  'Brand Presentation',
  'Other',
];

const TIMELINES = ['ASAP (1–3 days)', 'Within 1 week', '1–2 weeks', 'Flexible'];

export const OnboardingWizard = ({ open, onClose, initialPlan }) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    package_id: initialPlan || 'per_slide',
    slide_count: 10,
    full_name: '',
    email: '',
    company: '',
    project_type: 'Pitch Deck',
    timeline: 'Within 1 week',
    description: '',
  });

  useEffect(() => {
    if (initialPlan) {
      setFormData((prev) => ({ ...prev, package_id: initialPlan }));
    }
  }, [initialPlan]);

  useEffect(() => {
    if (open) setStep(1);
  }, [open]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const totalSteps = 4;
  const isPerSlide = formData.package_id === 'per_slide';

  // Validation per step
  const canProceed = () => {
    if (step === 1) {
      if (isPerSlide && (!formData.slide_count || formData.slide_count < 1)) return false;
      return true;
    }
    if (step === 2) {
      return (
        formData.full_name.trim().length >= 2 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      );
    }
    if (step === 3) {
      return formData.description.trim().length >= 10;
    }
    return true;
  };

  const computedTotal = () => {
    if (isPerSlide) return 15 * (formData.slide_count || 0);
    return 999;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        package_id: formData.package_id,
        slide_count: isPerSlide ? Number(formData.slide_count) : null,
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        company: formData.company.trim() || null,
        project_type: formData.project_type,
        timeline: formData.timeline,
        description: formData.description.trim(),
        origin_url: window.location.origin,
      };

      const { data } = await axios.post(`${API}/onboarding/create-checkout`, payload);

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Could not start checkout. Please try again.');
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.detail || 'Something went wrong. Please try again.';
      toast.error(typeof msg === 'string' ? msg : 'Request failed');
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl bg-background border-border p-0 overflow-hidden max-h-[92vh] overflow-y-auto"
        data-testid="onboarding-wizard"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#2A7AFE] font-semibold">
                Onboarding
              </p>
              <h2 className="text-2xl font-semibold text-foreground mt-1">
                Tell us about your project
              </h2>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                  n <= step ? 'bg-[#2A7AFE]' : 'bg-border'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 min-h-[320px]">
          {/* Step 1 — Plan */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-foreground mb-3 block text-base font-medium">
                  Selected plan
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {['per_slide', 'monthly_retainer'].map((pid) => (
                    <button
                      key={pid}
                      data-testid={`wizard-plan-${pid}`}
                      onClick={() => updateField('package_id', pid)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        formData.package_id === pid
                          ? 'border-[#2A7AFE] bg-[#2A7AFE]/10'
                          : 'border-border hover:border-[#2A7AFE]/50'
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {pid === 'per_slide' ? 'Per Slide' : 'Monthly Retainer'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pid === 'per_slide' ? '$15 / slide' : '$999 / month'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {isPerSlide && (
                <div>
                  <Label htmlFor="slide_count" className="text-foreground mb-2 block">
                    Number of slides
                  </Label>
                  <Input
                    id="slide_count"
                    data-testid="wizard-slide-count"
                    type="number"
                    min={1}
                    max={500}
                    value={formData.slide_count}
                    onChange={(e) => updateField('slide_count', e.target.value)}
                    className="bg-card border-border text-foreground"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Estimated total: <span className="text-foreground font-semibold">${computedTotal()}</span>
                  </p>
                </div>
              )}

              {!isPerSlide && (
                <div className="p-4 bg-card border border-border rounded-xl">
                  <p className="text-sm text-foreground font-medium">Monthly Retainer</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    $999 / month — up to 100 slide credits. Priority queue and consistent design system.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Contact */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name" className="text-foreground mb-2 block">Your name *</Label>
                <Input
                  id="full_name"
                  data-testid="wizard-name"
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  placeholder="Jane Doe"
                  className="bg-card border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground mb-2 block">Email *</Label>
                <Input
                  id="email"
                  data-testid="wizard-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="jane@company.com"
                  className="bg-card border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="company" className="text-foreground mb-2 block">Company (optional)</Label>
                <Input
                  id="company"
                  data-testid="wizard-company"
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  placeholder="Acme Inc."
                  className="bg-card border-border text-foreground"
                />
              </div>
            </div>
          )}

          {/* Step 3 — Project details */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-foreground mb-2 block">Project type</Label>
                <select
                  data-testid="wizard-project-type"
                  value={formData.project_type}
                  onChange={(e) => updateField('project_type', e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-card border border-border text-foreground text-sm"
                >
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-foreground mb-2 block">Timeline</Label>
                <select
                  data-testid="wizard-timeline"
                  value={formData.timeline}
                  onChange={(e) => updateField('timeline', e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-card border border-border text-foreground text-sm"
                >
                  {TIMELINES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="description" className="text-foreground mb-2 block">
                  Tell us about your project *
                </Label>
                <Textarea
                  id="description"
                  data-testid="wizard-description"
                  rows={5}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Audience, goals, key messages, brand guidelines, references, etc."
                  className="bg-card border-border text-foreground resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 10 characters ({formData.description.trim().length}/10)
                </p>
              </div>
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-5 bg-card border border-border rounded-xl">
                <p className="text-xs uppercase tracking-widest text-[#2A7AFE] font-semibold mb-3">
                  Order Summary
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="text-foreground font-medium">
                      {isPerSlide ? 'Per Slide' : 'Monthly Retainer'}
                    </span>
                  </div>
                  {isPerSlide && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Slides</span>
                      <span className="text-foreground font-medium">{formData.slide_count} × $15</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project type</span>
                    <span className="text-foreground font-medium">{formData.project_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timeline</span>
                    <span className="text-foreground font-medium">{formData.timeline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact</span>
                    <span className="text-foreground font-medium">{formData.email}</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-border flex justify-between items-baseline">
                    <span className="text-foreground font-semibold">Total</span>
                    <span className="text-2xl font-semibold text-[#2A7AFE]">
                      ${computedTotal()}
                      <span className="text-sm text-muted-foreground ml-1">USD</span>
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                You'll be redirected to Stripe for secure checkout.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border flex items-center justify-between gap-3">
          <button
            data-testid="wizard-back"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || submitting}
            className="px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {step < totalSteps ? (
            <button
              data-testid="wizard-next"
              onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
              disabled={!canProceed()}
              className="px-6 py-2.5 rounded-lg bg-[#2A7AFE] hover:bg-[#3B82F6] text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              data-testid="wizard-submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-[#2A7AFE] hover:bg-[#3B82F6] text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Proceed to Payment
                </>
              )}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
