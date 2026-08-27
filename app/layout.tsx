import './globals.css';

import type { Metadata } from 'next';
import { Manrope, Open_Sans } from 'next/font/google';

const openSans = Open_Sans({
    variable: '--font-open-sans',
    subsets: ['latin'],
    weight: ['400'],
});

const manrope = Manrope({
    variable: '--font-manrope',
    subsets: ['latin'],
    weight: ['300'],
});

export const metadata: Metadata = {
    title: 'PROTOCOL7',
    description: 'remote shell',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`
                    ${openSans.variable}
                    ${manrope.variable}
                    antialiased
                `}
            >
                {children}
            </body>
        </html>
    );
}
