import { DangerZoneSection } from '@/components/DangerZoneSection';
import { ProfileSection } from '@/components/ProfileSection';

/** The Profile tab: who you are, and deleting the account at the end. */
export function AccountView() {
  return (
    <>
      <ProfileSection />
      <DangerZoneSection />
    </>
  );
}
