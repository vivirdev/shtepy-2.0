
export interface Memory {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  date: string;
  author: string;
  authorRole: string;
  likes: number;
  comments: number;
}

export interface LegacyItem {
  id: string;
  title: string;
  lockedUntil: string;
  from: string;
  isUnlocked: boolean;
  thumbnail: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  parentId?: string;
  spouseId?: string;
  birthYear: string;
  deathYear?: string;
  bio: string;
  memoryCount: number;
  location: string;
  birthPlace: string;
  traits: string[];
  contribution: string;
}

export type AppTab = 'feed' | 'vault' | 'tree' | 'legacy' | 'add';
