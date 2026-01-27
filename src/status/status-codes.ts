export enum StatusCode {
    Success = 200,
    BadRequest = 400,
    InternalServerError = 500,
    StudentAlreadySignedUp = 5009,
    StudentAlreadyIsAStudent = 5010,
    StudentAlreadyOnWaitingList = 5011,
    NoSpotsAvailable = 5012,
    WaitingListFull = 5013,
    StudentDoesNotMeetMinimumAge = 5014,
    InvalidLessonTime = 5015,
}

export class StatusMessageStatusTextMap {
    static [StatusCode.Success] = "Success";
    static [StatusCode.BadRequest] = "Bad request";
    static [StatusCode.InternalServerError] = "Internal server error";
    static [StatusCode.StudentAlreadySignedUp] = "Student is already signed up";
    static [StatusCode.StudentAlreadyIsAStudent] = "Student is already enrolled";
    static [StatusCode.StudentAlreadyOnWaitingList] = "Student is already on the waiting list";
    static [StatusCode.NoSpotsAvailable] = "No spots are currently available";
    static [StatusCode.WaitingListFull] = "Waiting list is currently full";
    static [StatusCode.StudentDoesNotMeetMinimumAge] = "Student does not meet minimum age of 6 to enroll";
    static [StatusCode.InvalidLessonTime] = "Lesson time must be between 9 AM and 6 PM";
}
