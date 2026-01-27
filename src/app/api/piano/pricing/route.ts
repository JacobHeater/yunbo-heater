import { GoogleSheets } from "@/lib/google-sheets";

export async function GET() {
  try {
    const sheets = new GoogleSheets();
    const pricing = await sheets.getPricing();
    return Response.json({ pricing });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return Response.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}