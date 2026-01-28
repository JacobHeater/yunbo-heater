export enum ReadFormat {
  DATE = "MM/dd/yyyy",
  TIME = "hh:mm AM/PM",
  CURRENCY = "$0.00",
  TIME_SPAN = "HH hours mm minutes",
}

export enum WriteFormat {
  DATE = "yyyy-MM-dd",
  TIME = "HH:mm",
  CURRENCY = "0.00",
  TIME_SPAN = "HH:mm:ss",
}

export function convertReadTimeSpanToWriteFormat(readFormat: string): string {
  const parts = readFormat.split(" ");
  let hours = 0;
  let minutes = 0;

  for (let i = 0; i + 1 < parts.length; i += 2) {
    const value = parseInt(parts[i]);
    const unit = parts[i + 1];

    if (isNaN(value)) break;

    if (unit.startsWith("hour")) {
      hours = value;
    } else if (unit.startsWith("minute")) {
      minutes = value;
    }
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
}
