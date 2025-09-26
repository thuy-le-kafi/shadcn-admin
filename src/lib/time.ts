import { format, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const formatDateToString = (
  date: Date | null | undefined,
  formatOutput = 'yyyyMMdd',
  locale = enUS
) => {
  if (date == null || !isValid(date)) {
    return null;
  }

  return format(date, formatOutput, { locale });
};
