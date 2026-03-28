import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simple slur filter (expand as needed)
const SLURS = ['slur1', 'slur2', 'badword1']; // Add real Bengali/English slurs here
const PHONE_PATTERN = /(\+88)?01[3-9]\d{8}/g;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function filterContent(text: string): { clean: boolean; message?: string } {
  if (PHONE_PATTERN.test(text)) {
    return { clean: false, message: 'Please remove phone numbers for safety.' };
  }
  if (EMAIL_PATTERN.test(text)) {
    return { clean: false, message: 'Please remove email addresses for safety.' };
  }
  
  const lowerText = text.toLowerCase();
  for (const slur of SLURS) {
    if (lowerText.includes(slur)) {
      return { clean: false, message: 'Your content contains prohibited language.' };
    }
  }

  return { clean: true };
}

// Simple IP hash simulation for client-side (not secure, but better than nothing)
// In a real app, this should be done on the server.
export async function getIpHash(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    const ip = data.ip;
    // Simple hash
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
      const char = ip.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash.toString(36);
  } catch (e) {
    return 'anonymous-' + Math.random().toString(36).substring(2, 9);
  }
}

// Rate limiting simulation
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const history = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
  const validHistory = history.filter((ts: number) => now - ts < windowMs);
  
  if (validHistory.length >= limit) {
    return false;
  }
  
  validHistory.push(now);
  localStorage.setItem(`rate_limit_${key}`, JSON.stringify(validHistory));
  return true;
}
