import { CoachSection } from '@/components/CoachSection';
import { ConnectedAppsSection } from '@/components/ConnectedAppsSection';

/** The AI & apps tab: the coach, and assistants that reach Habits+ over MCP. */
export function AccountAiView() {
  return (
    <>
      <CoachSection />
      <ConnectedAppsSection />
    </>
  );
}
