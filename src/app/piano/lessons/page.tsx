"use client";

import { useEffect, useState } from 'react';
import SignupForm from "@/components/SignupForm";
import LessonPricingDisplay from "@/components/LessonPricingDisplay";
import WorkingHoursDisplay from "@/components/WorkingHoursDisplay";
import { FaCalendarAlt, FaBullhorn, FaMusic, FaExclamationTriangle } from 'react-icons/fa';
import { Availability } from '@/app/models/availability';
import { LessonPrice } from '@/app/models/pricing';
import type { WorkingHours } from '@/schema/working-hours';

export default function PianoLessons() {
  const [availabilityData, setAvailabilityData] = useState<Availability | null>(null);
  const [pricing, setPricing] = useState<LessonPrice[] | null>(null);
  const [loading, setLoading] = useState(true); // availability
  const [pricingLoading, setPricingLoading] = useState(true);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [workingHoursLoading, setWorkingHoursLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const availabilityRes = await fetch('/api/piano/availability');
        if (!mounted) return;
        const availability = await availabilityRes.json();
        setAvailabilityData(availability);
        setLoading(false);

        try {
          const pricingRes = await fetch('/api/piano/pricing');
          if (!mounted) return;
          const pricingData = pricingRes.ok ? await pricingRes.json() : null;
          setPricing(pricingData.pricing);
        } catch (pricingErr) {
          console.error('Error fetching pricing:', pricingErr);
        } finally {
          if (mounted) setPricingLoading(false);
        }

        try {
          const hoursRes = await fetch('/api/teacher/working-hours');
          if (!mounted) return;
          const hoursData = hoursRes.ok ? await hoursRes.json() : null;
          setWorkingHours(hoursData.workingHours || []);
        } catch (hoursErr) {
          console.error('Error fetching working hours:', hoursErr);
        } finally {
          if (mounted) setWorkingHoursLoading(false);
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
        if (mounted) setError('Unable to load page data.');
        if (mounted) setLoading(false);
        if (mounted) setPricingLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Don't block rendering on availability; show the page immediately and
  // render inline placeholders. If availability failed and we have no data,
  // show a small inline error banner instead of a full-screen overlay.
  const showErrorBanner = !!error && !availabilityData;

  // Helper values for spots banner
  const lowSpots = (availabilityData?.spotsAvailable || 0) < 5;
  const spotLabel = availabilityData?.spotsAvailable === 1 ? 'Spot' : 'Spots';

  if (!loading && !availabilityData?.available) {
    if (availabilityData?.waitingListAvailable) {
      return (
        <div className="min-h-[calc(100vh-5rem)] bg-background">
          <section className="py-16">
            <div className="container text-center">
              <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
                Piano Lessons with Yunbo Heater
              </h1>
              <p className="text-lg text-foreground/80 leading-relaxed mb-8">
                Thank you for your interest in piano lessons. I&apos;m currently at capacity for immediate enrollment, but I have spots available on my waiting list. Please complete the form below to be added to the waiting list, and I will contact you as soon as a spot opens up.
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-2">
                  <FaCalendarAlt className="text-blue-600 text-2xl mr-2" />
                  <span className="font-semibold text-blue-800">Waiting List Available</span>
                </div>
                <p className="text-blue-700">Join our waiting list to be notified when spots become available!</p>
              </div>

              {pricing && <LessonPricingDisplay pricing={pricing} />}

              <WorkingHoursDisplay workingHours={workingHours} loading={workingHoursLoading} />

              <SignupForm buttonText="Join Waiting List" mode="waitingList" disabled={loading} />
            </div>
          </section>
        </div>
      );
    } else {
      return (
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-background">
          <div className="text-center max-w-2xl mx-auto px-4">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-foreground mb-4">Currently Full<FaExclamationTriangle className="inline text-4xl ml-2 align-middle" /></h1>
            </div>

            <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
              I&apos;m thrilled with my current group of wonderful piano students, and my waiting list is also at capacity right now. It&apos;s a great problem to have - so many enthusiastic musicians!
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Don&apos;t Worry!</h3>
              <p className="text-foreground/70 leading-relaxed">
                Spots may open up throughout the year as students&apos; schedules change. I recommend checking back often to see if spots become available.
              </p>
            </div>

            <p className="text-foreground/60 italic">
              In the meantime, keep practicing that beautiful music! <FaMusic className="inline text-2xl ml-1 align-middle" />
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background">
      <section className="py-16">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
            Piano Lessons with Yunbo Heater
          </h1>
          {showErrorBanner && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6 max-w-2xl mx-auto">Unable to load availability — showing limited information.</div>
          )}
          {loading ? (
            <p className="text-lg text-foreground/80 leading-relaxed mb-8">Thanks for your interest — checking Yunbo&apos;s availability...</p>
          ) : (
            <p className="text-lg text-foreground/80 leading-relaxed mb-8">
              Thank you for your interest in piano lessons. It is a privilege to share the joy of music with students of all ages and abilities. Please complete the form below, and I will be in touch shortly to discuss how we can begin your musical journey together.
            </p>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-4 text-center">Lesson Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pricingLoading ? (
                // Minimal placeholders — show three simple skeleton cells
                [0, 1, 2].map(i => (
                  <div key={i} className="text-center">
                    <div className="h-6 w-20 mx-auto bg-foreground/10 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-16 mx-auto bg-foreground/10 rounded animate-pulse"></div>
                  </div>
                ))
              ) : (
                (pricing || []).map(({ length, cost }: LessonPrice) => {
                  const displayLength = length === 20 ? 60 : length;
                  return (
                    <div key={`${length}-${cost}`} className="text-center">
                      <div className="text-2xl font-bold text-blue-600">${cost}</div>
                      <div className="text-sm text-foreground/70">{displayLength} minutes</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <WorkingHoursDisplay workingHours={workingHours} loading={workingHoursLoading} />

          {!loading && (availabilityData?.spotsAvailable || 0) <= 10 && (
            <div className={`${lowSpots ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'} rounded-lg p-4 mb-8 max-w-2xl mx-auto`}>
              <div className="flex items-center justify-center mb-2">
                <FaBullhorn className={`${lowSpots ? 'text-red-600' : 'text-blue-600'} text-2xl mr-2`} />
                <span className={`${lowSpots ? 'text-red-800' : 'text-blue-800'} font-semibold`}>Only {availabilityData?.spotsAvailable} {spotLabel} Left!</span>
              </div>
              <p className={`${lowSpots ? 'text-red-700' : 'text-blue-700'}`}>Spots fill up quickly. Secure your spot in piano lessons today!</p>
            </div>
          )}

          <SignupForm buttonText="Sign Up for Lessons" mode="signup" disabled={loading} />
        </div>
      </section>
    </div>
  );
}
