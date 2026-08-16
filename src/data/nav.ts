import type { NavItem } from '../types';

export const navItems: NavItem[] = [
  { label: 'about.md', filename: 'about.md', href: '/about', filetype: 'markdown' },
  { label: 'blog/', filename: 'blog/', href: '/blog', filetype: 'directory' },
  { label: 'experience.lua', filename: 'experience.lua', href: '/experience', filetype: 'lua' },
  { label: 'resume.pdf', filename: 'resume.pdf', href: '/vaibhav-resume.pdf', filetype: 'pdf', newTab: true },
  { label: 'contact.sh', filename: 'contact.sh', href: '/contact', filetype: 'bash' },
];
