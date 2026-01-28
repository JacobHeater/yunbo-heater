import { StatusCode } from "@/status/status-codes";
import { StudentRollTable } from "../../../../schema/student-roll";
import { WaitingListTable } from "../../../../schema/waiting-list";
import { ConfigurationTable } from "../../../../schema/configuration";

export async function GET() {
  try {
    const studentRoll = new StudentRollTable();
    const waitingListTable = new WaitingListTable();
    const configTable = new ConfigurationTable();

    const students = await studentRoll.readAllAsync();
    const waitingList = await waitingListTable.readAllAsync();
    const configRows = await configTable.readAllAsync();

    const config: Record<string, any> = {};
    configRows.forEach((row) => {
      const key = row.key;
      const value = row.value;
      switch (row.type) {
        case "number":
          config[key] = parseInt(value);
          break;
        case "decimal":
          config[key] = parseFloat(value);
          break;
        case "string":
        default:
          config[key] = value;
          break;
      }
    });

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
