export interface ColumnDefinition {
  name: string;
  dataType: string;
  nullable: boolean;
}

export interface Table<T> {
  name: string;
  columns: ColumnDefinition[];
  propertyMap: Record<string, keyof T>;
}
