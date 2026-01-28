interface LessonPricingDisplayProps {
  pricing: { length: number; cost: string }[];
}

export default function LessonPricingDisplay({ pricing }: LessonPricingDisplayProps) {
  if (!pricing || pricing.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold text-foreground mb-4 text-center">Lesson Pricing</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pricing.map(({ length, cost }) => {
          const displayLength = length === 20 ? 60 : length;
          return (
            <div key={`${length}-${cost}`} className="text-center">
              <div className="text-2xl font-bold text-green-600">${cost}</div>
              <div className="text-sm text-foreground/70">{displayLength} minutes</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}