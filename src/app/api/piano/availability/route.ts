import { StatusCode } from "@/status/status-codes";
import { StudentRollTable } from "../../../../schema/student-roll";
import { WaitingListTable } from "../../../../schema/waiting-list";
import { ConfigurationManager } from "../../../../schema/configuration";
import { Availability } from "@/app/models/availability";

export async function GET() {
  try {
    const studentRoll = new StudentRollTable();
    const waitingListTable = new WaitingListTable();
    const configManager = new ConfigurationManager();

    const students = await studentRoll.readAllAsync();
    const waitingList = await waitingListTable.readAllAsync();
    const config = await configManager.getConfigurationMap();
    
    const maxStudents = Number(config.maxStudents) || 0;
    const maxWaitingListSize = Number(config.maxWaitingListSize) || 0;
    const spotsAvailable = Math.max(0, maxStudents - students.length);
    const waitingListSpotsAvailable = Math.max(0, maxWaitingListSize - waitingList.length);

    if (students.length >= maxStudents) {
      return Response.json({ 
        available: false,
        waitingListAvailable: waitingListSpotsAvailable > 0,
        waitingListSpotsAvailable
      } as Availability);
    }
    return Response.json({
      available: true,
      spotsAvailable,
      waitingListAvailable: waitingListSpotsAvailable > 0,
      waitingListSpotsAvailable,
    } as Availability);
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error);
    return Response.json(
      { error: "Failed to fetch student roll" },
      { status: StatusCode.InternalServerError },
    );
  }
}
