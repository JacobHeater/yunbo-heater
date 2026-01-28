"use client";

import { useEffect, useState } from 'react';
import LessonPricingDisplay from '@/components/LessonPricingDisplay';

export default function PricingClient() {
  const [pricing, setPricing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/piano/pricing');
        if (!mounted) return;
        const data = res.ok ? await res.json() : null;
        setPricing(data);
      } catch (err) {
        console.error('Error fetching pricing:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 text-foreground/70 mb-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
        <span className="text-sm">Loading pricing...</span>
      </div>
    );
  }

  if (!pricing) return null;

  return <LessonPricingDisplay pricing={pricing.pricing} />;
}
