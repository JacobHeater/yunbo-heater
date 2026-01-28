import { ColumnDefinition, GoogleSheetsTableBase } from "./table";
import { DataType } from './data-types';

export interface Admin {
  id: string;
  emailAddress: string;
  password: string;
}

export class AdminTable extends GoogleSheetsTableBase<Admin> {
  name: string = "Admin";
  columns: Record<keyof Admin, ColumnDefinition> = {
    id: {
      name: "Id",
      dataType: DataType.String,
      nullable: false,
    },
    emailAddress: {
      name: "Email Address",
      dataType: DataType.String,
      nullable: false,
    },
    password: {
      name: "Password",
      dataType: DataType.String,
      nullable: false,
    },
  };
  readAllAsync(): Promise<Admin[]> {
    throw new Error("Method not implemented.");
  }
  readOneAsync(id: string): Promise<Admin | null> {
    throw new Error("Method not implemented.");
  }
}
