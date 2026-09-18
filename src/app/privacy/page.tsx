import type { Metadata } from 'next';
import PrivacyNotice from './PrivacyNotice';

export const metadata: Metadata = {
  title: 'Privacy | Double Slit Experiment',
  description:
    'Informativa privacy della simulazione Double Slit Experiment di Asyntes. Privacy notice for the Double Slit Experiment simulation by Asyntes.',
  openGraph: {
    title: 'Privacy | Double Slit Experiment',
    description:
      'Informativa privacy della simulazione Double Slit Experiment di Asyntes.',
    url: 'https://double-slit.vercel.app/privacy',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return <PrivacyNotice />;
}
