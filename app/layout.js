import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './globals.css';

import Navbar from '@/components/Navbar';
import { PerfumesProvider } from '@/components/PerfumesProvider';

export const metadata = {
  title: 'Coleção de Perfumes',
  description: 'Cadastre sua coleção de perfumes e sua lista de desejos.',
  icons: { icon: 'https://icons.iconarchive.com/icons/iconarchive/mothers-day/48/Perfume-Bottle-icon.png' },
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" data-bs-theme="dark">
      <body>
        <PerfumesProvider>
          <Navbar />
          <div className="container py-3">
            <header className="text-center mb-3">
              <h1 style={{ fontSize: '1.6rem' }}>Minha Coleção de Perfumes</h1>
            </header>
            {children}
          </div>
        </PerfumesProvider>
      </body>
    </html>
  );
}
