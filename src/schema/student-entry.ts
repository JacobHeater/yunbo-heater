import { Table, ColumnDefinition } from "./table";

export interface StudentEntryRow {
  id: string;
  studentName: string;
  phoneNumber: string;
  emailAddress: string;
  age: number;
  lessonDay: string;
  lessonTime: string;
  duration: string;
  skillLevel: string;
  startDate: string;
  notes?: string;
}

export abstract class StudentEntry implements Table<StudentEntryRow> {
  abstract name: string;
  columns: ColumnDefinition[] = [
    {
      name: "Id",
      dataType: "string",
      nullable: false,
    },
    {
      name: "Student Name",
      dataType: "string",
      nullable: false,
    },
    {
      name: "Phone Number",
      dataType: "string",
      nullable: false,
    },
    {
      name: "Email Address",
      dataType: "string",
      nullable: false,
    },
    {
      name: "Age",
      dataType: "number",
      nullable: false,
    },
    {
      name: "Lesson Day",
      dataType: "string",
      nullable: false,
    },
    {
      name: "Lesson Time",
      dataType: "Time",
      nullable: false,
    },
    {
      name: "Duration",
      dataType: "TimeSpan",
      nullable: false,
    },
    {
      name: "Skill Level",
      dataType: "string",
      nullable: false,
    },
    {
      name: "Start Date",
      dataType: "Date",
      nullable: false,
    },
    {
      name: "Notes",
      dataType: "string",
      nullable: true,
    },
  ];
  propertyMap: Record<string, keyof StudentEntryRow> = {
    Id: "id",
    "Student Name": "studentName",
    "Phone Number": "phoneNumber",
    "Email Address": "emailAddress",
    Age: "age",
    "Lesson Day": "lessonDay",
    "Lesson Time": "lessonTime",
    Duration: "duration",
    "Skill Level": "skillLevel",
    "Start Date": "startDate",
    Notes: "notes",
  };
}
