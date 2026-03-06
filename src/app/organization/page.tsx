import type { Metadata } from 'next'
import { OrgProfileHub } from './org-profile-hub'

export const metadata: Metadata = {
  title: 'My Organization | GrantLink',
  description:
    'Set up your organization profile to get personalized grant matches, pre-filled reports, and a connected experience across all GrantLink tools.',
}

export default function OrganizationPage() {
  return <OrgProfileHub />
}
