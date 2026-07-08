// Build-time data loaders for donor + release data.

import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_DIR = path.resolve('./public');

function readJsonSync<T>(relPath: string): T {
  const full = path.join(PUBLIC_DIR, relPath.replace(/^\//, ''));
  return JSON.parse(fs.readFileSync(full, 'utf-8'));
}

export interface DonorFamily {
  family: string;
  slug: string;
  license: string;
  author: string;
  file_count: number;
  covers_count: number;
  first_cover: string;
  role: string;
  planes: string[];
  parsed_coverage_count: number;
  source_type: string;
  vendor: string;
}

export interface Release {
  tag: string;
  name: string;
  date: string;
  url: string;
  otc_url?: string;
  coverage_url?: string;
}

export function loadDonors(): DonorFamily[] {
  const data = readJsonSync<{ families: DonorFamily[] }>('donors.json');
  return data.families || [];
}

export function loadDonor(slug: string): DonorFamily | null {
  const families = loadDonors();
  return families.find(f => f.slug === slug) ?? null;
}

export function loadReleases(): Release[] {
  return readJsonSync<Release[]>('releases.json');
}
