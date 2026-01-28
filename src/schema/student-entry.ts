import { WriteFormat, ReadFormat } from "./formatting";
import { GoogleSheetsTableBase, ColumnDefinition } from "./table";
import { DataType } from "./data-types";

export interface StudentEntry {
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
  minutelyRate: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const studentEntryColumns: Record<keyof StudentEntry, ColumnDefinition> = {
  id: {
    name: "Id",
    dataType: DataType.String,
    nullable: false,
  },
  studentName: {
    name: "Student Name",
    dataType: DataType.String,
    nullable: false,
  },
  phoneNumber: {
    name: "Phone Number",
    dataType: DataType.String,
    nullable: false,
  },
  emailAddress: {
    name: "Email Address",
    dataType: DataType.String,
    nullable: false,
  },
  age: {
    name: "Age",
    dataType: DataType.Number,
    nullable: false,
  },
  lessonDay: {
    name: "Lesson Day",
    dataType: DataType.String,
    nullable: false,
  },
  lessonTime: {
    name: "Lesson Time",
    dataType: DataType.Time,
    nullable: false,
    writeFormat: WriteFormat.TIME,
    readFormat: ReadFormat.TIME
  },
  duration: {
    name: "Duration",
    dataType: DataType.TimeSpan,
    nullable: false,
    writeFormat: WriteFormat.TIME_SPAN,
    readFormat: ReadFormat.TIME_SPAN
  },
  skillLevel: {
    name: "Skill Level",
    dataType: DataType.String,
    nullable: false,
  },
  startDate: {
    name: "Start Date",
    dataType: DataType.Date,
    nullable: false,
    writeFormat: WriteFormat.DATE,
    readFormat: ReadFormat.DATE
  },
  minutelyRate: {
    name: "Minutely Rate",
    dataType: DataType.Currency,
    nullable: false,
    writeFormat: WriteFormat.CURRENCY,
    readFormat: ReadFormat.CURRENCY
  },
  notes: {
    name: "Notes",
    dataType: DataType.String,
    nullable: true,
  },
  createdAt: {
    name: "Created At",
    dataType: DataType.DateTime,
    nullable: true,
  },
  updatedAt: {
    name: "Updated At",
    dataType: DataType.DateTime,
    nullable: true,
  },
};



export abstract class StudentEntryTable extends GoogleSheetsTableBase<StudentEntry> {
  abstract name: string;
  columns: Record<keyof StudentEntry, ColumnDefinition> = studentEntryColumns;
}
