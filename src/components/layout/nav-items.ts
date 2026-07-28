import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, ShieldAlert, MessageSquareWarning, FileBarChart, Trophy, Users, Settings,
  Home, Smile, HeartPulse, MessageSquareWarning as SpeakUpIcon, BookOpen, History,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const leaderNavItems: NavItem[] = [
  { href: '/leader/dashboard', label: 'Live Intelligence', icon: LayoutDashboard },
  { href: '/leader/risks', label: 'Psychosocial Risk', icon: ShieldAlert },
  { href: '/leader/speak-up', label: 'Speak Up Cases', icon: MessageSquareWarning },
  { href: '/leader/challenges', label: 'Team Challenges', icon: Trophy },
  { href: '/leader/reports', label: 'Reports', icon: FileBarChart },
  { href: '/leader/people', label: 'People & Org', icon: Users },
  { href: '/leader/settings', label: 'Settings', icon: Settings },
];

export const employeeNavItems: NavItem[] = [
  { href: '/employee/home', label: 'Home', icon: Home },
  { href: '/employee/checkin', label: 'Daily Check-in', icon: Smile },
  { href: '/employee/who5', label: 'WHO-5 Assessment', icon: HeartPulse },
  { href: '/employee/history', label: 'My History', icon: History },
  { href: '/employee/resources', label: 'Resources', icon: BookOpen },
  { href: '/employee/speak-up', label: 'Speak Up', icon: SpeakUpIcon },
];
