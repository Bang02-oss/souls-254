import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth, loginWithRedirect, logout } from 'zitejs/auth';
import { Menu, X } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { cn } from '@project/components/lib/utils';
import { useMe } from '../lib/me';

export default function Layout() {
  const { user } = useAuth();
  const { me } = useMe();
  const [open, setOpen] = useState(false);
  const links = [
    { to: '/jobs', label: 'Jobs' },
    { to: '/freelancers', label: 'Freelancers' },
    ...(user ? [{ to: '/messages', label: 'Messages' }, { to: '/earnings', label: 'Earnings' }, { to: '/profile', label: 'Profile' }] : []),
    ...(me?.isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];
  const nav = (
    <>
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
          className={({ isActive }) => cn('text-sm font-medium transition-colors', isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
          {l.label}
        </NavLink>
      ))}
      {user ? (
        <Button variant="outline" size="sm" onClick={() => logout()}>Sign out</Button>
      ) : (
        <Button size="sm" onClick={() => loginWithRedirect({ redirectUrl: '/jobs' })}>Get started</Button>
      )}
    </>
  );
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-bold text-foreground">Souls<span className="text-primary">254</span></Link>
          <nav className="hidden md:flex items-center gap-6">{nav}</nav>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
        {open && <nav className="md:hidden flex flex-col gap-4 px-6 pb-4 items-start">{nav}</nav>}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Souls 254 · Freelance work from Kenya to the world</footer>
    </div>
  );
}
