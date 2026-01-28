import { WaitingListTable } from "../../../../schema/waiting-list";
import { SignupsTable } from "../../../../schema/signups";
import { ConfigurationTable } from "../../../../schema/configuration";
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

    const signups = new SignupsTable();
    const waitingList = new WaitingListTable();
    const config = new ConfigurationTable();

    // Check if already signed up
    const existingSignups = await signups.readAllAsync();
    if (existingSignups.some(s => s.emailAddress === body.emailAddress)) {
      return Response.json({ error: StatusMessageStatusTextMap[StatusCode.StudentAlreadySignedUp], status: StatusCode.StudentAlreadySignedUp }, { status: 400 });
    }

    // Check if already on waiting list
    const existingWaiting = await waitingList.readAllAsync();
    if (existingWaiting.some(s => s.emailAddress === body.emailAddress)) {
      return Response.json({ error: StatusMessageStatusTextMap[StatusCode.StudentAlreadyOnWaitingList], status: StatusCode.StudentAlreadyOnWaitingList }, { status: 400 });
    }

    // Check waiting list size
    const configData = await config.readAllAsync();
    const maxWaiting = configData.find(c => c.key === 'maxWaitingListSize')?.value;
    if (maxWaiting && existingWaiting.length >= parseInt(maxWaiting)) {
      return Response.json({ error: StatusMessageStatusTextMap[StatusCode.WaitingListFull], status: StatusCode.WaitingListFull }, { status: 400 });
    }

    await waitingList.upsertOneAsync(body);

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
