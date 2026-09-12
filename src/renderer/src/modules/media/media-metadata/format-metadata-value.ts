import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const ISO_DATE_TIME =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}(?::?\d{2})?)?$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EXIF_DATE_TIME =
  /^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[+-]\d{2}:\d{2})?$/;
const EXIF_DATE = /^\d{4}:\d{2}:\d{2}$/;

const DATETIME_FORMAT = 'MMM D, YYYY h:mm:ss A';
const DATE_FORMAT = 'MMM D, YYYY';

const formatIfValid = (value: string, parsed: dayjs.Dayjs, template: string): string =>
  parsed.isValid() ? parsed.format(template) : value;

export const formatMetadataValue = (value: string): string => {
  if (ISO_DATE_TIME.test(value)) {
    return formatIfValid(value, dayjs(value), DATETIME_FORMAT);
  }
  if (ISO_DATE.test(value)) {
    return formatIfValid(value, dayjs(value), DATE_FORMAT);
  }
  if (EXIF_DATE_TIME.test(value)) {
    return formatIfValid(
      value,
      dayjs(value, ['YYYY:MM:DD HH:mm:ss', 'YYYY:MM:DD HH:mm:ss.SSS'], true),
      DATETIME_FORMAT
    );
  }
  if (EXIF_DATE.test(value)) {
    return formatIfValid(value, dayjs(value, 'YYYY:MM:DD', true), DATE_FORMAT);
  }
  return value;
};
