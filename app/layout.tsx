import type { Metadata } from 'next'
import ThemeRegistry from '@/components/ThemeRegistry'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'LoanFlow - Loan Application & OR/CR System',
  description: 'Enterprise loan application and receipt management system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeRegistry>
            {children}
          </ThemeRegistry>
        </AuthProvider>
      </body>
    </html>
  )
}
