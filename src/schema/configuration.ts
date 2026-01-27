import { Table, ColumnDefinition } from "./table";

export interface AppConfig {
  maxStudents: number;
  maxWaitingListSize: number;
}

export interface ConfigurationRow {
  key: string;
  value: string;
  type: string;
}

export class Configuration implements Table<ConfigurationRow> {
  name: string = "Configuration";
  columns: ColumnDefinition[] = [
    {
      name: "Key",
      dataType: "string",
      nullable: false,
    },
    {
      name: "Value",
      dataType: "string",
      nullable: false,
    },
    {
      name: "Type",
      dataType: "string",
      nullable: false,
    },
  ];
  propertyMap: Record<string, keyof ConfigurationRow> = {
    Key: "key",
    Value: "value",
    Type: "type",
  };
}
