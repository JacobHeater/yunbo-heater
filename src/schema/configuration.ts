import { GoogleSheetsTableBase, ColumnDefinition } from "./table";
import { DataType } from './data-types';

export interface Configuration {
  id: string;
  key: string;
  value: string;
  type: string;
}

export class ConfigurationTable extends GoogleSheetsTableBase<Configuration> {
  name: string = "Configuration";
  columns: Record<keyof Configuration, ColumnDefinition> = {
    id: {
      name: "Id",
      dataType: DataType.String,
      nullable: false,
    },
    key: {
      name: "Key",
      dataType: DataType.String,
      nullable: false,
    },
    value: {
      name: "Value",
      dataType: DataType.String,
      nullable: false,
    },
    type: {
      name: "Type",
      dataType: DataType.String,
      nullable: false,
    },
  };

  // Update an existing configuration row by matching the Key column.
  async updateByKeyAsync(key: string, value: string, type: string): Promise<void> {
    // Read all rows to find existing and preserve id if present
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.name,
    });
    const rows = response.data.values || [];
    if (rows.length === 0) throw new Error("No header row found");
    const header = rows[0];
    const dataRows = rows.slice(1);
    const keyColumnName = this.columns.key.name;
    const keyIndex = header.indexOf(keyColumnName);
    if (keyIndex === -1) throw new Error(`${keyColumnName} column not found`);
    const existingRowIndex = dataRows.findIndex((row) => row[keyIndex] === key);
    if (existingRowIndex === -1) throw new Error(`Configuration key not found: ${key}`);

    // Try to read the existing entry via readAllAsync to pick up the id
    const existingEntries = await this.readAllAsync();
    const found = existingEntries.find((r) => r.key === key) as Configuration | undefined;

    // Build an entry object respecting columns order, preserving id when possible
    const entry: Partial<Configuration> = {};
    entry.id = found?.id || undefined;
    entry.key = key;
    entry.value = value;
    entry.type = type;
    const formattedRow = this.formatRowForWrite(entry as Configuration);

    const range = `${this.name}!A${existingRowIndex + 2}:Z${existingRowIndex + 2}`;
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values: [formattedRow] },
    });
  }
}

export class ConfigurationManager {
  private table: ConfigurationTable = new ConfigurationTable();

  async getConfigurationMap(): Promise<Record<string, unknown>> {
    const configRows = await this.table.readAllAsync();
    const config: Record<string, unknown> = {};
    configRows.forEach((row) => {
      const key = row.key;
      const value = row.value;
      switch (row.type) {
        case "number":
          config[key] = Number.parseInt(value);
          break;
        case "decimal":
          config[key] = Number.parseFloat(value);
          break;
        case "string":
        default:
          config[key] = value;
          break;
      }
    });
    return config;
  }
}