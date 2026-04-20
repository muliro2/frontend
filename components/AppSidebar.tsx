'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Wrench,
  Package,
  Factory,
  Briefcase,
  DollarSign,
  Users,
  UserRound,
  Presentation,
  AlertTriangle,
  Bell,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const moduleItems: NavItem[] = [
  { label: 'Painel', href: '/', icon: LayoutGrid },
  { label: 'Mecânica e manutenção', href: '/', icon: Wrench },
  { label: 'Incidentes', href: '/incidentes', icon: AlertTriangle },
  { label: 'Almoxarifado', href: '#', icon: Package },
  { label: 'Produção', href: '#', icon: Factory },
  { label: 'Comercial', href: '#', icon: Briefcase },
  { label: 'Financeiro', href: '#', icon: DollarSign },
  { label: 'Departamento pessoal', href: '#', icon: Users },
  { label: 'RH', href: '#', icon: UserRound },
  { label: 'Apresentação e resultados', href: '#', icon: Presentation },
];

const systemItems: NavItem[] = [
  { label: 'Notificações', href: '#', icon: Bell },
  { label: 'Configurações', href: '#', icon: Settings },
];

const isActive = (pathname: string, href: string) => {
  if (href === '#') return false;
  if (href === '/') return pathname === '/' || pathname.startsWith('/ordem-servico');
  return pathname === href || pathname.startsWith(`${href}/`);
};

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-r bg-background">
      <div className="border-b px-5 py-6">
        <Image src="/monitoro-logo.png" alt="Monitoro" width={132} height={30} priority />
        <p className="mt-3 text-sm text-muted-foreground">Acert</p>
      </div>

      <nav className="px-3 py-4">
        <p className="mb-2 px-3 text-xs text-muted-foreground">Módulos</p>
        <ul className="space-y-1">
          {moduleItems.map(item => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted',
                    active && 'bg-muted font-medium',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mb-2 mt-6 px-3 text-xs text-muted-foreground">Sistema</p>
        <ul className="space-y-1">
          {systemItems.map(item => {
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <Link href={item.href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
