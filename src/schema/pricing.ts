import { ColumnDefinition, Table } from "./table";

export interface PricingRow {
  price: number;
  rate: string;
}

export class Pricing implements Table<PricingRow> {
  name: string = "Pricing";
  columns: ColumnDefinition[] = [
    {
      name: "Price",
      dataType: "currency",
      nullable: false,
    },
    {
      name: "Rate",
      dataType: "string",
      nullable: false,
    },
  ];
  propertyMap: Record<string, keyof PricingRow> = {
    "Price": "price",
    "Rate": "rate",
  };
}
