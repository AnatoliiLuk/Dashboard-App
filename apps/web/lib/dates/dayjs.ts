import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/uk';

dayjs.extend(customParseFormat);

export { dayjs };
