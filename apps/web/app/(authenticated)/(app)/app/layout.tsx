import { DesktopSidebar } from './desktop-sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
    return (
        <div className='relative flex flex-col min-h-screen bg-gray-100 lg:flex-row dark:bg-gray-950'>
            <DesktopSidebar className='hidden lg:flex flex-col' />
            <div className='p-4 border-l bg-background border-border lg:w-full lg:p-8'>{children}</div>
        </div>
    );
}
