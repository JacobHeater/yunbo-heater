import { DataType } from "./data-types";
import { ReadFormat, WriteFormat } from "./formatting";
import { ColumnDefinition, GoogleSheetsTableBase } from "./table";

export interface WorkingHours {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
}

export class WorkingHoursTable extends GoogleSheetsTableBase<WorkingHours> {
    name: string = "Working Hours";
    columns: Record<keyof WorkingHours, ColumnDefinition> = {
        id: {
            name: "Id",
            dataType: DataType.String,
            nullable: false,
        },
        dayOfWeek: {
            name: "Day Of Week",
            dataType: DataType.String,
            nullable: false,
        },
        startTime: {
            name: "Start Time",
            dataType: DataType.Time,
            nullable: false,
            readFormat: ReadFormat.TIME,
            writeFormat: WriteFormat.TIME,
        },
        endTime: {
            name: "End Time",
            dataType: DataType.Time,
            nullable: false,
            readFormat: ReadFormat.TIME,
            writeFormat: WriteFormat.TIME,
        },
    };
}