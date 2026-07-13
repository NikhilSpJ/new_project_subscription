import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Subscription Dashboard",
  description: "Subscription Entitlement & Billing Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 text-white shadow">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <h1 className="text-xl font-bold">Subscription Dashboard</h1>

            <div className="flex gap-6">
              <Link href="/" className="hover:text-gray-200">
                Dashboard
              </Link>

              <Link href="/plans" className="hover:text-gray-200">
                Plans
              </Link>

              <Link href="/history" className="hover:text-gray-200">
                History
              </Link>

              <Link href="/entitlements" className="hover:text-gray-200">
                Entitlements
              </Link>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-6xl p-6">
          {children}
        </main>
      </body>
    </html>
  );
}