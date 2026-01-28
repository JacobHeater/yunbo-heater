import { GoogleSheetsTableBase, ColumnDefinition } from "./table";
import { WriteFormat, ReadFormat } from "./formatting";
import { DataType } from './data-types';

export interface Pricing {
  id: string;
  price: number;
  rate: string;
}

export class PricingTable extends GoogleSheetsTableBase<Pricing> {
  name: string = "Pricing";
  columns: Record<keyof Pricing, ColumnDefinition> = {
    id: {
      name: "Id",
      dataType: DataType.String,
      nullable: false,
    },
    price: {
      name: "Price",
      dataType: DataType.Currency,
      nullable: false,
      writeFormat: WriteFormat.CURRENCY,
      readFormat: ReadFormat.CURRENCY
    },
    rate: {
      name: "Rate",
      dataType: DataType.String,
      nullable: false,
    },
  };
}
