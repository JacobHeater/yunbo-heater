import { google, sheets_v4 } from "googleapis";
import { Table } from "../schema/table";
import { StudentEntryRow } from "../schema/student-entry";
import { StudentRoll } from "../schema/student-roll";
import { AdminRow, Admin } from "../schema/admin";
import { AppConfig, Configuration } from "../schema/configuration";
import { PricingRow, Pricing } from "../schema/pricing";
import { WaitingList } from "../schema/waiting-list";
import { Signups } from "../schema/signups";
import { StatusCode } from "../status/status-codes";
import { v4 as uuid } from "uuid";

export class GoogleSheets {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor() {
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
    this.spreadsheetId = process.env.SPREADSHEET_ID || "";
  }

  private async addRow<T>(
    tableCtor: new () => Table<T>,
    data: T,
  ): Promise<void> {
    const table = new tableCtor();
    const headers = table.columns.map((c) => c.name);
    const hasIdCol = table.columns.some((c) => c.name.toLowerCase() === "id");

    if (hasIdCol) {
      (data as any).id = uuid();
    }

    const row = headers.map((header) => {
      const prop = table.propertyMap[header];
      const value = (data as any)[prop];
      return value?.toString() || "";
    });
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: table.name,
      valueInputOption: "RAW",
      requestBody: {
        values: [row],
      },
    });
  }

  async isSpotAvailable(): Promise<boolean> {
    const students = await this.getStudentRoll();
    const config = await this.getConfiguration();
    return students.length < config.maxStudents;
  }

  async getNumberOfSpotsAvailable(): Promise<number> {
    const students = await this.getStudentRoll();
    const config = await this.getConfiguration();
    return Math.max(0, config.maxStudents - students.length);
  }

  async isStudentAlreadySignedUp(email: string): Promise<boolean> {
    const signups = await this.getSignups();
    return signups.some((signup) => signup.emailAddress === email);
  }

  async isStudentAlreadyEnrolled(email: string): Promise<boolean> {
    const students = await this.getStudentRoll();
    return students.some((student) => student.emailAddress === email);
  }

  async isStudentOnWaitingList(email: string): Promise<boolean> {
    const waitingList = await this.getWaitingList();
    return waitingList.some((student) => student.emailAddress === email);
  }

  async signupNewStudent(studentData: StudentEntryRow): Promise<StatusCode> {
    if (await this.isStudentAlreadyEnrolled(studentData.emailAddress)) {
      return StatusCode.StudentAlreadyIsAStudent;
    }
    if (await this.isStudentOnWaitingList(studentData.emailAddress)) {
      return StatusCode.StudentAlreadyOnWaitingList;
    }
    if (await this.isStudentAlreadySignedUp(studentData.emailAddress)) {
      return StatusCode.StudentAlreadySignedUp;
    }
    if (!(await this.isSpotAvailable())) {
      return StatusCode.NoSpotsAvailable;
    }
    await this.addRow(Signups, studentData);
    return StatusCode.Success;
  }

  async addToWaitingList(studentData: StudentEntryRow): Promise<StatusCode> {
    if (await this.isStudentAlreadySignedUp(studentData.emailAddress)) {
      return StatusCode.StudentAlreadySignedUp;
    }
    if (await this.isStudentOnWaitingList(studentData.emailAddress)) {
      return StatusCode.StudentAlreadyOnWaitingList;
    }
    const waitingList = await this.getWaitingList();
    const config = await this.getConfiguration();
    if (waitingList.length >= config.maxWaitingListSize) {
      return StatusCode.WaitingListFull;
    }
    await this.addRow(WaitingList, studentData);
    return StatusCode.Success;
  }

  async addStudentManually(studentData: StudentEntryRow): Promise<StatusCode> {
    if (await this.isStudentAlreadyEnrolled(studentData.emailAddress)) {
      return StatusCode.StudentAlreadyIsAStudent;
    }
    await this.addRow(StudentRoll, studentData);
    return StatusCode.Success;
  }

  async updateStudent(id: string, updates: Partial<StudentEntryRow>): Promise<StatusCode> {
    await this.updateRow(StudentRoll, id, updates);
    return StatusCode.Success;
  }

  private async getRows<T>(tableCtor: new () => Table<T>): Promise<T[]> {
    const table = new tableCtor();
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: table.name,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return [];

    const headers = rows[0];
    return rows.slice(1).map((row) => {
      const obj = {} as T;
      headers.forEach((header, index) => {
        const value = row[index] || "";
        const prop = table.propertyMap[header];
        const column = table.columns.find((c) => c.name === header);
        if (prop && column) {
          if (column.nullable && !value) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (obj as any)[prop] = null;
          } else {
            switch (column.dataType) {
              case "number":
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (obj as any)[prop] = value ? parseFloat(value) : 0;
                break;
              case "currency":
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (obj as any)[prop] = value ? parseFloat(value.replace(/[$,]/g, '')) : null;
                break;
              case "Date":
              case "TimeSpan":
              case "string":
              default:
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (obj as any)[prop] = value;
                break;
            }
          }
        }
      });
      return obj;
    });
  }

  async getStudentRoll(): Promise<StudentEntryRow[]> {
    return this.getRows(StudentRoll);
  }

  async getAdmin(): Promise<AdminRow[]> {
    return this.getRows(Admin);
  }

  async getConfiguration(): Promise<AppConfig> {
    const rows = await this.getRows(Configuration);
    const config: Record<string, any> = {};
    rows.forEach((row) => {
      const key = row.key;
      const value = row.value;
      switch (row.type) {
        case "number":
          config[key] = parseInt(value);
          break;
        case "decimal":
          config[key] = parseFloat(value);
          break;
        case "string":
        default:
          config[key] = value;
          break;
      }
    });
    return config as AppConfig;
  }

  async getPricing(): Promise<PricingRow[]> {
    return this.getRows(Pricing);
  }

  async getWaitingList(): Promise<StudentEntryRow[]> {
    return this.getRows(WaitingList);
  }

  async getSignups(): Promise<StudentEntryRow[]> {
    return this.getRows(Signups);
  }

  async getStudents(): Promise<StudentEntryRow[]> {
    return this.getRows(StudentRoll);
  }

  async promoteFromWaitingList(id: string): Promise<void> {
    const waitingList = await this.getRows(WaitingList);
    const student = waitingList.find(s => s.id === id);
    if (student) {
      await this.addRow(StudentRoll, student);
      await this.deleteRow(WaitingList, id);
    }
  }

  async promoteFromSignups(id: string): Promise<void> {
    const signups = await this.getRows(Signups);
    const student = signups.find(s => s.id === id);
    if (student) {
      await this.addRow(StudentRoll, student);
      await this.deleteRow(Signups, id);
    }
  }

  async deleteFromWaitingList(id: string): Promise<void> {
    await this.deleteRow(WaitingList, id);
  }

  async deleteFromSignups(id: string): Promise<void> {
    await this.deleteRow(Signups, id);
  }

  private async deleteRow<T>(tableCtor: new () => Table<T>, id: string): Promise<void> {
    const table = new tableCtor();
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: table.name,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return;

    const headers = rows[0];
    const idIndex = headers.indexOf('Id');
    if (idIndex === -1) return;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idIndex] === id) {
        // Delete the entire row using batch update
        const rowNumber = i + 1; // 1-based
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: [{
              deleteDimension: {
                range: {
                  sheetId: await this.getSheetId(table.name),
                  dimension: 'ROWS',
                  startIndex: rowNumber - 1, // 0-based
                  endIndex: rowNumber // exclusive
                }
              }
            }]
          }
        });
        break;
      }
    }
  }

  private async updateRow<T>(tableCtor: new () => Table<T>, id: string, updates: Partial<T>): Promise<void> {
    const table = new tableCtor();
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: table.name,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return;

    const headers = rows[0];
    const idIndex = headers.indexOf('Id');
    if (idIndex === -1) return;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idIndex] === id) {
        // Update the row with new values
        const currentRow = rows[i];
        const updatedRow = [...currentRow];

        // Apply updates to the row
        Object.entries(updates).forEach(([propertyKey, value]) => {
          // Find the column name from the property name
          const columnName = Object.keys(table.propertyMap).find(
            key => table.propertyMap[key] === propertyKey
          );
          if (columnName) {
            const columnIndex = headers.indexOf(columnName);
            if (columnIndex !== -1) {
              updatedRow[columnIndex] = value?.toString() || '';
            }
          }
        });

        // Update the row using batch update
        const rowNumber = i + 1; // 1-based
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${table.name}!A${rowNumber}:${String.fromCharCode(65 + updatedRow.length - 1)}${rowNumber}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [updatedRow],
          },
        });
        break;
      }
    }
  }

  private async getSheetId(sheetName: string): Promise<number> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId
    });

    const sheet = response.data.sheets?.find(s => s.properties?.title === sheetName);
    if (!sheet?.properties?.sheetId) {
      throw new Error(`Sheet ${sheetName} not found`);
    }

    return sheet.properties.sheetId;
  }
}
