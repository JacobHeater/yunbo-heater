export async function GET() {
  const availability = {
    message: "Yunbo Heater Piano Lesson Availability",
    slots: [
      {
        date: "2026-01-26",
        time: "10:00 AM",
        available: true,
        duration: "60 minutes"
      },
      {
        date: "2026-01-26",
        time: "2:00 PM",
        available: false,
        duration: "60 minutes"
      },
      {
        date: "2026-01-27",
        time: "11:00 AM",
        available: true,
        duration: "30 minutes"
      },
      {
        date: "2026-01-27",
        time: "3:00 PM",
        available: true,
        duration: "60 minutes"
      }
    ],
    note: "Please contact via email to schedule a lesson."
  };

  return Response.json(availability);
}