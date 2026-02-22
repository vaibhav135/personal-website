import type { NavItem } from '../types';

export const navItems: NavItem[] = [
  { label: 'about.ts', filename: 'about.ts', href: '/', filetype: 'typescript' },
  { label: 'blog/', filename: 'blog/', href: '/blog', filetype: 'directory' },
  { label: 'experience.lua', filename: 'experience.lua', href: '/experience', filetype: 'lua' },
  { label: 'contact.sh', filename: 'contact.sh', href: '/contact', filetype: 'bash' },
];
