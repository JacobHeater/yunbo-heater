import { ColumnDefinition, Table } from "./table";

export interface AdminRow {
  emailAddress: string;
  password: string;
}

export class Admin implements Table<AdminRow> {
  name: string = "Admin";
  columns: ColumnDefinition[] = [
    {
      name: "Email Address",
      dataType: "string",
      nullable: false,
    },
    {
      name: "Password",
      dataType: "string",
      nullable: false,
    },
  ];
  propertyMap: Record<string, keyof AdminRow> = {
    "Email Address": "emailAddress",
    "Password": "password",
  };
}
