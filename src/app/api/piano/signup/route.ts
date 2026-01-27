import { GoogleSheets } from "../../../../lib/google-sheets";
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

    const wrapper = new GoogleSheets();
    const status = await wrapper.signupNewStudent(body);

    if (status !== StatusCode.Success) {
      const errorMessage = StatusMessageStatusTextMap[status] || "Failed to sign up.";
      return Response.json({ error: errorMessage, status }, { status: 400 });
    }

    return Response.json({ success: true, status: StatusCode.Success });
  } catch (error) {
    console.error("Error signing up:", error);
    return Response.json({ error: "Failed to sign up", status: StatusCode.InternalServerError }, { status: StatusCode.InternalServerError });
  }
}