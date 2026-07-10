// Build-time data loader for Essenfont release history.
import { loadJson } from './ssr';

export interface Release {
  tag: string;
  name: string;
  date: string;
  url: string;
  ttc_url?: string;
  otc_url?: string;
  coverage_url?: string;
  npm_url?: string;
  isLatest?: boolean;
  notes?: string;
  stats?: {
    codepoints?: number;
    pct?: number;
    planes?: number;
  };
}

export function loadReleases(): Release[] {
  return loadJson<Release[]>('releases.json');
}
