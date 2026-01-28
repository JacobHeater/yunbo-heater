import { StudentEntry, studentEntryColumns } from '@/schema/student-entry';
import { ColumnDefinition } from '@/schema/table';

export function getStudentColumn(property: keyof StudentEntry): ColumnDefinition | undefined {
  return studentEntryColumns[property];
}