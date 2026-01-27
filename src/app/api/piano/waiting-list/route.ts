import { GoogleSheets } from "../../../../lib/google-sheets";
import {
  StatusCode,
  StatusMessageStatusTextMap,
} from "../../../../status/status-codes";
import { validateStudentData } from "../../../../lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Server-side validation
    const validation = validateStudentData(body);
    if (!validation.isValid) {
      return Response.json({ error: validation.message }, { status: 400 });
    }

    const wrapper = new GoogleSheets();
    const status = await wrapper.addToWaitingList(body);

    if (status !== StatusCode.Success) {
      const errorMessage =
        StatusMessageStatusTextMap[status] || "Failed to sign up.";
      return Response.json({ error: errorMessage, status }, { status: 400 });
    }

    return Response.json({ success: true, status: StatusCode.Success });
  } catch (error) {
    console.error("Error adding to waiting list:", error);
    return Response.json(
      {
        error: "Failed to add to waiting list",
        status: StatusCode.InternalServerError,
      },
      { status: StatusCode.InternalServerError },
    );
  }
}
