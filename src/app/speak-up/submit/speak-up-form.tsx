'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Copy } from 'lucide-react';

const CATEGORIES = [
  { value: 'BULLYING', label: 'Bullying' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'UNSAFE_BEHAVIOUR', label: 'Unsafe behaviour' },
  { value: 'PSYCHOLOGICAL_SAFETY', label: 'Psychological safety concern' },
  { value: 'WORKPLACE_ISSUE', label: 'Workplace issue' },
  { value: 'ETHICAL_CONCERN', label: 'Ethical concern' },
  { value: 'GENERAL_WELLBEING', label: 'General wellbeing concern' },
];

export function SpeakUpForm({ isAuthenticated, defaultOrgSlug }: { isAuthenticated: boolean; defaultOrgSlug?: string }) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [orgSlug, setOrgSlug] = useState(defaultOrgSlug ?? '');
  const [identifyMe, setIdentifyMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  const canSubmit = category && description.length >= 20 && (isAuthenticated || orgSlug);

  async function submit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch('/api/speak-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        description,
        organizationSlug: isAuthenticated ? undefined : orgSlug,
        identifyMe,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.');
      return;
    }
    const data = await res.json();
    setTrackingCode(data.trackingCode);
  }

  if (trackingCode) {
    return (
      <Card className="border-success/40">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <ShieldCheck className="h-8 w-8 text-success" />
          <p className="font-medium">Your report has been submitted.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Save this tracking code — it&apos;s the only way to check your report&apos;s status. We cannot recover it for you.
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(trackingCode)}
            className="flex items-center gap-2 rounded-md border border-dashed border-primary/40 bg-primary/5 px-4 py-2 font-mono text-lg font-semibold text-primary"
          >
            {trackingCode} <Copy className="h-4 w-4" />
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground text-base font-semibold">Submit a report</CardTitle>
        <CardDescription>You do not need to identify yourself. Reports go to a de-identified case queue.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!isAuthenticated && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="org">Organisation code</Label>
            <Input id="org" value={orgSlug} onChange={(e) => setOrgSlug(e.target.value)} placeholder="e.g. acme-corp" />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">What happened?</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Share as much detail as you're comfortable with — what happened, when, and who was involved (roles rather than names is fine)."
            className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <p className="text-xs text-muted-foreground">{description.length}/5000 (minimum 20 characters)</p>
        </div>
        {isAuthenticated && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={identifyMe} onChange={(e) => setIdentifyMe(e.target.checked)} className="h-4 w-4 rounded border-input" />
            I&apos;m comfortable identifying myself to the case handler (optional)
          </label>
        )}
        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Button onClick={submit} disabled={!canSubmit || submitting}>
          {submitting ? 'Submitting…' : 'Submit report'}
        </Button>
      </CardContent>
    </Card>
  );
}
