import { StatusCode } from "@/status/status-codes";
import { GoogleSheets } from "../../../../lib/google-sheets";

export async function GET() {
  try {
    const wrapper = new GoogleSheets();
    const students = await wrapper.getStudentRoll();
    const waitingList = await wrapper.getWaitingList();
    const config = await wrapper.getConfiguration();

    const spotsAvailable = Math.max(0, config.maxStudents - students.length);
    const waitingListSpotsAvailable = Math.max(0, config.maxWaitingListSize - waitingList.length);

    if (students.length >= config.maxStudents) {
      return Response.json({ 
        available: false,
        waitingListAvailable: waitingListSpotsAvailable > 0,
        waitingListSpotsAvailable
      });
    }
    return Response.json({
      available: true,
      spotsAvailable,
      waitingListAvailable: waitingListSpotsAvailable > 0,
      waitingListSpotsAvailable,
    });
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error);
    return Response.json(
      { error: "Failed to fetch student roll" },
      { status: StatusCode.InternalServerError },
    );
  }
}
