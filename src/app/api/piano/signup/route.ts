import { StudentRollTable } from "../../../../schema/student-roll";
import { WaitingListTable } from "../../../../schema/waiting-list";
import { SignupsTable } from "../../../../schema/signups";
import { ConfigurationTable } from "../../../../schema/configuration";
import { StatusCode, StatusMessageStatusTextMap } from "../../../../status/status-codes";
import { validateStudentData } from "../../../../lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Server-side validation
    const validation = validateStudentData(body);
    if (!validation.isValid) {
      let statusCode = StatusCode.BadRequest;
      
      // Check for specific validation errors and return appropriate status codes
      if (validation.message?.includes('Lesson time must be between 9 AM and 6 PM')) {
        statusCode = StatusCode.InvalidLessonTime;
      } else if (validation.message?.includes('minimum age')) {
        statusCode = StatusCode.StudentDoesNotMeetMinimumAge;
      }
      
      return Response.json({ error: validation.message, status: statusCode }, { status: 400 });
    }

    const studentRoll = new StudentRollTable();
    const waitingList = new WaitingListTable();
    const signups = new SignupsTable();
    const config = new ConfigurationTable();

    // Check if already enrolled
    const enrolled = await studentRoll.readAllAsync();
    if (enrolled.some(s => s.emailAddress === body.emailAddress)) {
      return Response.json({ error: StatusMessageStatusTextMap[StatusCode.StudentAlreadyIsAStudent], status: StatusCode.StudentAlreadyIsAStudent }, { status: 400 });
    }

    // Check if on waiting list
    const waiting = await waitingList.readAllAsync();
    if (waiting.some(s => s.emailAddress === body.emailAddress)) {
      return Response.json({ error: StatusMessageStatusTextMap[StatusCode.StudentAlreadyOnWaitingList], status: StatusCode.StudentAlreadyOnWaitingList }, { status: 400 });
    }

    // Check if already signed up
    const existingSignups = await signups.readAllAsync();
    if (existingSignups.some(s => s.emailAddress === body.emailAddress)) {
      return Response.json({ error: StatusMessageStatusTextMap[StatusCode.StudentAlreadySignedUp], status: StatusCode.StudentAlreadySignedUp }, { status: 400 });
    }

    // Check if spot available
    const configData = await config.readAllAsync();
    const maxStudents = configData.find(c => c.key === 'maxStudents')?.value;
    if (maxStudents && enrolled.length >= parseInt(maxStudents)) {
      return Response.json({ error: StatusMessageStatusTextMap[StatusCode.NoSpotsAvailable], status: StatusCode.NoSpotsAvailable }, { status: 400 });
    }

    await signups.upsertOneAsync(body);

    return Response.json({ success: true, status: StatusCode.Success });
  } catch (error) {
    console.error("Error signing up:", error);
    return Response.json({ error: "Failed to sign up", status: StatusCode.InternalServerError }, { status: StatusCode.InternalServerError });
  }
}