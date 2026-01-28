interface LessonPricingDisplayProps {
  pricing: { length: number; cost: string }[] | null;
  loading?: boolean;
}

export default function LessonPricingDisplay({ pricing, loading = false }: LessonPricingDisplayProps) {
  if (!loading && (!pricing || pricing.length === 0)) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold text-foreground mb-4 text-center">Lesson Pricing</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          // Show skeleton loaders while loading
          [0, 1, 2].map(i => (
            <div key={i} className="text-center">
              <div className="h-8 w-16 mx-auto bg-blue-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-12 mx-auto bg-blue-100 rounded animate-pulse"></div>
            </div>
          ))
        ) : (
          pricing?.map(({ length, cost }) => {
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
  );
}