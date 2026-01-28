import { google, sheets_v4 } from "googleapis";
import { v4 as uuidv4 } from 'uuid';
import { ReadFormat, WriteFormat } from "./formatting";
import { DataType } from "./data-types";

export interface ColumnDefinition {
  name: string;
  dataType: DataType;
  nullable: boolean;
  writeFormat?: WriteFormat;
  readFormat?: ReadFormat;
}

export interface GoogleSheetsTable<T> {
  name: string;
  columns: Record<keyof T, ColumnDefinition>;
}

export abstract class GoogleSheetsTableBase<T> implements GoogleSheetsTable<T> {
  constructor(sheetId: string = process.env.SPREADSHEET_ID || "") {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheets = google.sheets({ version: "v4", auth });
    this.spreadsheetId = sheetId;
  }

  public abstract name: string;
  public abstract columns: Record<keyof T, ColumnDefinition>;

  protected sheets: sheets_v4.Sheets;
  protected spreadsheetId: string;

  protected async getSheetId(): Promise<number> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
    });
    const sheet = response.data.sheets?.find(
      (s) => s.properties?.title === this.name,
    );
    if (!sheet || !sheet.properties?.sheetId)
      throw new Error(`Sheet ${this.name} not found`);
    return sheet.properties.sheetId;
  }

  /**
   * Return the configured id column name from the schema columns.
   * Supports case-insensitive key lookup and also checks ColumnDefinition.name.
   */
  protected getIdColumnName(): string {
    // direct 'id' key on columns
    const colsRecord = this.columns as unknown as Record<string, ColumnDefinition>;
    if (colsRecord['id'] && colsRecord['id'].name) return colsRecord['id'].name;

    // case-insensitive key match
    for (const key of Object.keys(this.columns)) {
      if (key.toLowerCase() === 'id') {
        const def = colsRecord[key];
        if (def && def.name) return def.name;
      }
    }

    // fallback: check ColumnDefinition.name values for an 'id' header
    for (const key of Object.keys(this.columns)) {
      const def = colsRecord[key];
      if (def && def.name && typeof def.name === 'string' && def.name.toLowerCase() === 'id') {
        return def.name;
      }
    }

    throw new Error('Schema error: no id column defined on table columns. Please add an `id` column to the schema for table "' + this.name + '".');
  }

  /**
   * Return the configured column name for a given schema key (e.g. 'createdAt').
   * Returns null when the schema does not define that key.
   */
  protected getColumnNameForKey(key: string): string | null {
    const colsRecord2 = this.columns as unknown as Record<string, ColumnDefinition>;
    if (colsRecord2[key] && colsRecord2[key].name) return colsRecord2[key].name;

    // try case-insensitive key match
    for (const k of Object.keys(this.columns)) {
      if (k.toLowerCase() === key.toLowerCase()) {
        const def = colsRecord2[k];
        if (def && def.name) return def.name;
      }
    }

    // try matching by ColumnDefinition.name value (case-insensitive)
    for (const k of Object.keys(this.columns)) {
      const def = colsRecord2[k];
      if (def && def.name && typeof def.name === 'string' && def.name.toLowerCase() === key.toLowerCase()) {
        return def.name;
      }
    }

    return null;
  }

  protected formatRowForWrite(entry: T): string[] {
    const row: string[] = [];
    for (const key in this.columns) {
      const column = this.columns[key];
      const value = (entry as unknown as Record<string, unknown>)[key] as string;
      const formatted = this.writeFormatValue(value, column);
      row.push(formatted);
    }
    return row;
  }

  protected writeFormatValue(value: string, column: ColumnDefinition): string {
    if (!column.writeFormat) return value;

    switch (column.writeFormat) {
      case WriteFormat.TIME:
        return this.convertTo24Hour(value);
      case WriteFormat.DATE:
        const date = new Date(value);
        return date.toISOString().split("T")[0];
      case WriteFormat.CURRENCY:
        return parseFloat(value.replace(/[$,]/g, "")).toFixed(2);
      case WriteFormat.TIME_SPAN:
        // Check if it's already in HH:MM:SS format
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
          const parts = value.split(":");
          return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:${parts[2] || "00"}`;
        }
        // Parse formatted duration like "30 minutes" or "1 hour 30 minutes"
        const durationMatch = value.match(
          /(\d+)\s+hour(?:s)?(?:\s+(\d+)\s+min(?:s)?)?|(\d+)\s+minute(?:s)?/,
        );
        let hours = 0,
          minutes = 0;
        if (durationMatch) {
          if (durationMatch[1]) {
            // hours and possibly minutes
            hours = parseInt(durationMatch[1]);
            minutes = durationMatch[2] ? parseInt(durationMatch[2]) : 0;
          } else if (durationMatch[3]) {
            // only minutes
            minutes = parseInt(durationMatch[3]);
          }
        }
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
      default:
        return value;
    }
  }

  protected convertTo24Hour(time12: string): string {
    if (!time12) return "";
    // If already in 24-hour format, return as-is
    if (!time12.includes("AM") && !time12.includes("PM")) return time12;

    const [time, ampm] = time12.split(" ");
    const [hours, minutes] = time.split(":");
    let hour24 = parseInt(hours);
    if (ampm === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (ampm === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    return `${hour24.toString().padStart(2, "0")}:${minutes}`;
  }

  async upsertOneAsync(entry: T): Promise<void> {
    // Ensure the entry has an id; generate one for new records
    if (!(entry as unknown as Record<string, unknown>).id) {
      (entry as unknown as Record<string, unknown>).id = uuidv4();
    }
    // Read all rows to find existing
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.name,
    });
    const rows = response.data.values || [];
    if (rows.length === 0) throw new Error("No header row found");
    const header = rows[0];
    const dataRows = rows.slice(1);
    const idColumnName = this.getIdColumnName();
    const idIndex = header.indexOf(idColumnName);
    if (idIndex === -1) throw new Error(`${idColumnName} column not found`);
    const existingRowIndex = dataRows.findIndex(
      (row) => row[idIndex] === (entry as unknown as Record<string, unknown>).id,
    );

    // Build a map of column name -> formatted value based on our schema columns
    const orderedColumnNames: string[] = [];
    for (const key in this.columns) {
      orderedColumnNames.push(this.columns[key].name);
    }
    const formattedOrdered = this.formatRowForWrite(entry);
    const colNameToFormatted: Record<string, string> = {};
    for (let i = 0; i < orderedColumnNames.length; i++) {
      colNameToFormatted[orderedColumnNames[i]] = formattedOrdered[i] ?? '';
    }

    // Prepare target row aligned to the sheet header
    const targetRow: string[] = new Array(header.length).fill('');
    for (let i = 0; i < header.length; i++) {
      const h = header[i];
      if (colNameToFormatted.hasOwnProperty(h)) {
        targetRow[i] = colNameToFormatted[h];
      }
    }

    // Use schema-driven column names for Created At / Updated At (if present)
    const createdAtName = this.getColumnNameForKey('createdAt');
    const updatedAtName = this.getColumnNameForKey('updatedAt');
    const createdAtIndex = createdAtName ? header.indexOf(createdAtName) : -1;
    const updatedAtIndex = updatedAtName ? header.indexOf(updatedAtName) : -1;
    const today = new Date().toISOString();

    if (existingRowIndex >= 0) {
      // Update existing row: preserve Created At if present in sheet, set Updated At
      if (createdAtIndex !== -1) {
        const existingCreated = (dataRows[existingRowIndex] || [])[createdAtIndex] || '';
        targetRow[createdAtIndex] = existingCreated || today;
      }
      if (updatedAtIndex !== -1) {
        targetRow[updatedAtIndex] = today;
      }
      // Ensure id column is populated
      targetRow[idIndex] = (entry as unknown as Record<string, unknown>).id as string;

      const range = `${this.name}!A${existingRowIndex + 2}:Z${existingRowIndex + 2}`;
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: "RAW",
        requestBody: { values: [targetRow] },
      });
    } else {
      // Append new row: set Created At to today if column exists; do NOT set Updated At on insert
      if (createdAtIndex !== -1) targetRow[createdAtIndex] = today;
      // Ensure id column is populated
      targetRow[idIndex] = (entry as unknown as Record<string, unknown>).id as string;

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: this.name,
        valueInputOption: "RAW",
        requestBody: { values: [targetRow] },
      });
    }
  }

  async upsertManyAsync(entries: T[]): Promise<void> {
    for (const entry of entries) {
      await this.upsertOneAsync(entry);
    }
  }

  async deleteOneAsync(id: string): Promise<void> {
    // Read all rows to find the row to delete
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.name,
    });
    const rows = response.data.values || [];
    if (rows.length === 0) return; // Nothing to delete
    const header = rows[0];
    const dataRows = rows.slice(1);
    const idColumnName = this.getIdColumnName();
    const idIndex = header.indexOf(idColumnName);
    if (idIndex === -1) throw new Error(`${idColumnName} column not found`);
    const rowIndex = dataRows.findIndex((row) => row[idIndex] === id);
    if (rowIndex === -1) return; // Not found
    // Delete the row by clearing it (Google Sheets doesn't have delete row in values API easily)
    // Alternatively, use batchUpdate to delete the row
    const request = {
      spreadsheetId: this.spreadsheetId,
      resource: {
        requests: [
          {
            deleteRange: {
              range: {
                sheetId: await this.getSheetId(),
                startRowIndex: rowIndex + 1, // +1 for header
                endRowIndex: rowIndex + 2,
              },
              shiftDimension: "ROWS",
            },
          },
        ],
      },
    };
    await this.sheets.spreadsheets.batchUpdate(request);
  }

  async deleteManyAsync(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.deleteOneAsync(id);
    }
  }

  protected convertTo12Hour(time24: string): string {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    let hour12 = parseInt(hours);
    const ampm = hour12 >= 12 ? 'PM' : 'AM';
    if (hour12 > 12) hour12 -= 12;
    if (hour12 === 0) hour12 = 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  protected readFormatValue(value: string, column: ColumnDefinition): unknown {
    if (!column.readFormat) return value;

    const format = column.readFormat;

    // Parse format strings and apply appropriate formatting
    if (format.includes('AM/PM') || format.includes('hh:mm')) {
      return this.convertTo24Hour(value);
    } else if (format.startsWith('$')) {
      return `$${parseFloat(value).toFixed(2)}`;
    } else if (format.includes('/')) {
      // Date format like MM/dd/yyyy
      // If the value is a date-only ISO string (yyyy-MM-dd), construct as local date
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const parts = value.split('-').map((p) => parseInt(p, 10));
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        return date.toLocaleDateString('en-US');
      }
      const date = new Date(value);
      return date.toLocaleDateString('en-US');
    } else if (format.includes('hours') && format.includes('minutes')) {
      // Duration format like "HH hours mm minutes"
      const [hours, minutes] = value.split(':').map(Number);
      const hoursText = hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''}` : '';
      const minutesText = minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : '';
      return [hoursText, minutesText].filter(Boolean).join(' ') || '0 minutes';
    } else {
      // Fallback for unrecognized formats
      return value;
    }
  }

  protected parseRowFromRead(row: string[], header: string[]): T {
    const entry: Record<string, unknown> = {};
    const keys = Object.keys(this.columns) as Array<keyof T>;
    for (const key of keys) {
      const column = this.columns[key];
      const colIndex = header.indexOf(column.name);
      const value = colIndex >= 0 ? row[colIndex] || '' : '';
      if (value === '' && column.nullable) {
        entry[key as string] = null;
      } else {
        entry[key as string] = this.readFormatValue(value, column);
      }
    }
    return entry as T;
  }

  async readAllAsync(): Promise<T[]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.name,
    });
    const rows = response.data.values || [];
    if (rows.length <= 1) return []; // no data
    const header = rows[0];
    const dataRows = rows.slice(1);
    return dataRows.map(row => this.parseRowFromRead(row, header));
  }

  async readOneAsync(id: string): Promise<T | null> {
    const all = await this.readAllAsync();
    return all.find(item => (item as unknown as Record<string, unknown>).id === id) || null;
  }
}


