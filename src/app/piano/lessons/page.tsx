import SignupForm from "@/components/SignupForm";
import LessonPricingDisplay from "@/components/LessonPricingDisplay";
import { FaCalendarAlt, FaBullhorn, FaMusic, FaExclamationTriangle } from 'react-icons/fa';

export default async function PianoLessons() {
  let data;
  let pricing;
  try {
    const [availabilityRes, pricingRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/piano/availability`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/piano/pricing`)
    ]);
    data = await availabilityRes.json();
    pricing = pricingRes.ok ? await pricingRes.json() : null;
  } catch (error) {
    console.error('Error fetching data:', error);
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Error</h1>
          <p className="text-lg text-foreground/80">
            Unable to load page data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Pricing data is already calculated by the API
  const lessonPricing = pricing?.pricing;

  // Helper values for spots banner
  const lowSpots = data.spotsAvailable < 5;
  const spotLabel = data.spotsAvailable === 1 ? 'Spot' : 'Spots';

  if (!data.available) {
    if (data.waitingListAvailable) {
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

              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-2">
                  <FaCalendarAlt className="text-blue-600 text-2xl mr-2" />
                  <span className="font-semibold text-blue-800">Waiting List Available</span>
                </div>
                <p className="text-blue-700">Join our waiting list to be notified when spots become available!</p>
              </div>

              {lessonPricing && <LessonPricingDisplay pricing={lessonPricing} />}

              <SignupForm buttonText="Join Waiting List" mode="waitingList" />
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
          <p className="text-lg text-foreground/80 leading-relaxed mb-8">
            Thank you for your interest in piano lessons. It is a privilege to share the joy of music with students of all ages and abilities. Please complete the form below, and I will be in touch shortly to discuss how we can begin your musical journey together.
          </p>

          {lessonPricing && <LessonPricingDisplay pricing={lessonPricing} />}

          {data.spotsAvailable <= 10 && (
            <div className={`${lowSpots ? 'bg-red-100 border-red-300' : 'bg-yellow-100 border-yellow-300'} rounded-lg p-4 mb-8 max-w-2xl mx-auto`}>
              <div className="flex items-center justify-center mb-2">
                <FaBullhorn className={`${lowSpots ? 'text-red-600' : 'text-yellow-600'} text-2xl mr-2`} />
                <span className={`${lowSpots ? 'text-red-800' : 'text-yellow-800'} font-semibold`}>Only {data.spotsAvailable} {spotLabel} Left!</span>
              </div>
              <p className={`${lowSpots ? 'text-red-700' : 'text-yellow-700'}`}>Spots fill up quickly. Secure your spot in piano lessons today!</p>
            </div>
          )}

          <SignupForm buttonText="Sign Up for Lessons" mode="signup" />
        </div>
      </section>
    </div>
  );
}
