import { ValueFormatterParams } from 'ag-grid-community';
import { formatDateToString } from '@/lib/time';

export const timeFormatterFromTimestamp = (params: ValueFormatterParams) => {
  const time = formatDateToString(new Date(params.value), 'HH:mm:ss');
  if (time) {
    return time;
  }
  return params.value;
};
