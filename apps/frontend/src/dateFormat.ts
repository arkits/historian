import { format } from 'date-fns';

export function prettyDate(date: Date) {
    return format(date, 'yyyy-MM-dd HH:mm:ss');
}
