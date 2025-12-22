import { Briefcase, ClipboardList, Code, FileText, Home } from 'lucide-react';
import type { NavItem } from '@/types/nav-item';

export const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/dashboard/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/dashboard/applications', label: 'Applications', icon: ClipboardList },
  { path: '/dashboard/documents', label: 'Documents', icon: FileText },
  { path: '/dashboard/leetcode', label: 'LeetCode', icon: Code },
];
