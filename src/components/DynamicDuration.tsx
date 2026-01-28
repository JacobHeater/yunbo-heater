'use client';

import { useState, useEffect } from 'react';

export default function DynamicDuration() {
  const [durationText, setDurationText] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch('/api/piano/pricing');
        if (res.ok) {
          const data = await res.json();
          if (data.pricing && data.pricing.length > 0) {
            const lengths = data.pricing.map((p: { length: number }) => p.length === 20 ? 60 : p.length);
            const min = Math.min(...lengths);
            const max = Math.max(...lengths);
            setDurationText(`${min} to ${max} minute sessions`);
          } else {
            setDurationText('20 to 45 minute sessions');
          }
        } else {
          setDurationText('20 to 45 minute sessions');
        }
      } catch (error) {
        console.error('Error fetching pricing:', error);
        setDurationText('20 to 45 minute sessions');
      }
    };
    fetchPricing();
  }, []);

  if (durationText === null) {
    return <span className="inline-block h-4 w-32 bg-foreground/10 rounded animate-pulse"></span>;
  }

  return <span className="text-foreground/70">{durationText}</span>;
}