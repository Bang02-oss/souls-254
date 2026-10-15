import { Link } from 'react-router-dom';
import { useAuth, loginWithRedirect } from 'zitejs/auth';
import { motion } from 'framer-motion';
import { Briefcase, MessageCircle, Wallet } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { LatestJobs } from '../components/JobCard';
import { CATEGORIES } from '../lib/constants';

export default function Landing() {
  const { user } = useAuth();
  const start = (role: 'Freelancer' | 'Client') => {
    localStorage.setItem('souls254_role', role);
    if (user) window.location.href = '/profile';
    else loginWithRedirect({ redirectUrl: '/profile' });
  };
  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">Freelance work · Kenya → the world</span>
          <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold leading-tight text-foreground">Work with clients worldwide, from Kenya</h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-lg">Find freelance work in writing, design, development, marketing, video and more. Chat with the client and get paid when the work is done.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => start('Freelancer')}>I want to work</Button>
            <Button size="lg" variant="outline" onClick={() => start('Client')}>I want to hire</Button>
          </div>
        </motion.div>
        <motion.img initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
          src="https://images.fillout.com/893369/4rkwhybwlf/generated-images/13cyf13sREyx2MEqEPj7e3/img_ntFuA-I_7q3P5i8i.jpg"
          alt="Freelancer working in a Nairobi café" className="w-full aspect-[4/3] object-cover rounded-2xl shadow-xl" />
      </section>

      <section className="bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-3 gap-8">
          {[
            { icon: Briefcase, t: 'Real jobs', d: 'Clients from abroad post work across 12 categories.' },
            { icon: MessageCircle, t: 'Private chat', d: 'Talk with your client inside each job.' },
            { icon: Wallet, t: 'Get paid', d: 'M-Pesa, PayPal or bank — tracked in your earnings.' },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t}><Icon className="h-6 w-6 text-primary" /><h3 className="mt-3 font-semibold">{t}</h3><p className="text-sm text-muted-foreground mt-1">{d}</p></div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-3xl font-bold">Newest jobs</h2>
          <Link to="/jobs" className="text-sm font-medium text-primary">See all →</Link>
        </div>
        <LatestJobs />
        <div className="mt-10 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => <Link key={c} to={`/jobs?category=${encodeURIComponent(c)}`} className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary">{c}</Link>)}
        </div>
      </section>
    </div>
  );
}
