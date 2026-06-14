import { SignIn } from '@clerk/nextjs';
import { Metadata } from 'next';

import { images } from '@/config/routing/image.route';

export const metadata: Metadata = {
  title: "QualCloud | Qual ID Auth",
  description: "SignIn",
  icons: {
    icon: images.QUAL_ID,
  }
};

export default function SiginInPage() {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      <SignIn />
      <div id='clerk-captcha' />
    </main>
  );
}