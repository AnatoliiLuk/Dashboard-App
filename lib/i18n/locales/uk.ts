import type { en } from './en';

type Copy<T> = {
  [Key in keyof T]: T[Key] extends string ? string : Copy<T[Key]>;
};

export const uk: Copy<typeof en> = {
  meta: {
    title: 'Habits+',
    description:
      'Щоденний журнал звичок. Позначте, що зробили сьогодні, і тримайте серію.',
  },
  common: {
    loading: 'Завантаження звичок…',
    add: 'Додати',
    save: 'Зберегти',
    cancel: 'Скасувати',
    delete: 'Видалити',
    edit: 'Редагувати',
    habit: 'Звичка',
  },
  shell: {
    brand: 'Habits+',
    menu: 'Меню',
    calendar: 'Календар',
    logHabits: 'Журнал звичок',
  },
  calendar: {
    label: 'Календар звичок',
    view: 'Вигляд календаря',
    description: 'Кожен день показує звички, які ви позначили виконаними.',
    month: 'Місяць',
    week: 'Тиждень',
    backTo: 'Назад до {{date}}',
    previousMonth: 'Попередній місяць',
    nextMonth: 'Наступний місяць',
    previousWeek: 'Попередній тиждень',
    nextWeek: 'Наступний тиждень',
    weekdays: {
      mon: 'Пн',
      tue: 'Вт',
      wed: 'Ср',
      thu: 'Чт',
      fri: 'Пт',
      sat: 'Сб',
      sun: 'Нд',
    },
  },
  log: {
    description: 'Додайте звичку й позначте, що зробили сьогодні.',
    empty: 'Додайте звичку, щоб почати серію.',
    newHabitColor: 'Колір нової звички',
    habitColor: 'Колір для {{name}}',
    undo: 'Відмінити',
    doneToday: 'Зроблено сьогодні',
  },
  streak: {
    fullWeek: 'Цілий тиждень поспіль.',
    days_one: '{{count}} день поспіль.',
    days_few: '{{count}} дні поспіль.',
    days_many: '{{count}} днів поспіль.',
    days_other: '{{count}} днів поспіль.',
    done: 'Гарно. Сьогодні зроблено.',
    open_one: '{{count}} день поспіль. Сьогодні ще відкрито.',
    open_few: '{{count}} дні поспіль. Сьогодні ще відкрито.',
    open_many: '{{count}} днів поспіль. Сьогодні ще відкрито.',
    open_other: '{{count}} днів поспіль. Сьогодні ще відкрито.',
    start: 'Зробіть це сьогодні, щоб почати серію.',
  },
  theme: {
    toggle: 'Перемкнути тему',
    toLight: 'Увімкнути світлу тему',
    toDark: 'Увімкнути темну тему',
  },
  colors: {
    sky: 'Блакитний',
    green: 'Зелений',
    amber: 'Бурштиновий',
    rose: 'Трояндовий',
    violet: 'Фіолетовий',
    teal: 'Бірюзовий',
  },
  locale: {
    label: 'Мова',
    en: 'EN',
    uk: 'УК',
  },
};
