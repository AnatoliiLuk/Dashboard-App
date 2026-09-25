export type Stat = {
  label: string;
  value: string;
  note: string;
};

export type Activity = {
  title: string;
  detail: string;
  time: string;
};

export type Dashboard = {
  greeting: string;
  stats: Stat[];
  activity: Activity[];
};

export function getDashboard(): Dashboard {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return {
    greeting,
    stats: [
      { label: 'Visitors', value: '1,284', note: '+12% this week' },
      { label: 'Signups', value: '86', note: '+4 today' },
      { label: 'Open tasks', value: '7', note: '2 due today' },
    ],
    activity: [
      {
        title: 'New signup',
        detail: 'Maya Chen joined the workspace',
        time: '2m ago',
      },
      {
        title: 'Report ready',
        detail: 'Weekly traffic summary is available',
        time: '1h ago',
      },
      {
        title: 'Task completed',
        detail: 'Homepage copy review was marked done',
        time: '3h ago',
      },
    ],
  };
}
