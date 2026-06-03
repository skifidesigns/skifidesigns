import React from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import { useAuth } from '../context/AuthContext';

/**
 * Sign-in wall shown above each AI Lab tool's form. The tool is FREE but
 * we require a Google login so we have a verified email + lead capture,
 * and to discourage drive-by abuse of the LLM/template-gen quotas.
 *
 * Renders `children` once `user` is signed in.
 */
export const AILabSignInGate = ({ toolLabel, children }) => {
  const { user, login } = useAuth();
  if (user) return children;
  return (
    <div
      className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center"
      data-testid="ai-lab-signin-gate"
    >
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#2A7AFE]/10 flex items-center justify-center">
        <GoogleIcon className="w-8 h-8" />
      </div>
      <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-3">
        Sign in to use this tool
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-7">
        {toolLabel} is free for founders. We just need a quick Google sign-in
        so we can deliver your results and keep this open for genuine startups.
      </p>
      <button
        type="button"
        onClick={login}
        data-testid="ai-lab-signin-btn"
        className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 transition-opacity"
      >
        <GoogleIcon className="w-5 h-5" />
        Continue with Google
      </button>
      <p className="text-[11px] text-muted-foreground mt-5">
        We use your email only to send results and contact you about your project. No spam.
      </p>
    </div>
  );
};
