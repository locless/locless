import { RootLayout } from '@/components/landing/root-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <RootLayout>{children}</RootLayout>;
}
