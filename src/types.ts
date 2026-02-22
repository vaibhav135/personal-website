export interface NavItem {
  label: string;
  filename: string;
  href: string;
  filetype: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
  tech: string[];
}

export interface Social {
  name: string;
  url: string;
  command: string;
}
