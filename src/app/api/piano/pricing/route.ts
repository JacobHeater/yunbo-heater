import { PricingTable } from "@/schema/pricing";
import { calculateLessonPricing } from "@/lib/student-utils";

export async function GET() {
  try {
    const pricingTable = new PricingTable();
    const rawPricing = await pricingTable.readAllAsync();
    let lessonPricing = null;

    // Use data from Google Sheets if available
    let ratePerMinute: number | null = null;
    if (rawPricing && rawPricing.length > 0 && rawPricing[0].price != null) {
      // Normalize price which may be a number or a formatted string like "$50.00"
      const raw = rawPricing[0].price;
      const asNumber = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[$,]/g, ''));
      if (Number.isFinite(asNumber)) {
        ratePerMinute = asNumber;
        lessonPricing = calculateLessonPricing(ratePerMinute, [20, 30, 45]);
      } else {
        console.warn('pricing: could not parse ratePerMinute from sheet:', raw);
      }
    }

    // Return both calculated lesson pricing and the raw per-minute rate (formatted)
    const formattedRate = ratePerMinute != null ? `$${ratePerMinute.toFixed(2)}` : null;
    return Response.json({ pricing: lessonPricing, rate: formattedRate });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return Response.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}