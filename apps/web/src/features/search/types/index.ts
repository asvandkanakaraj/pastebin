export interface SearchUser {
  id: string;
  email: string;
  username: string;
}

export interface SearchPaste {
  id: string;
  title: string | null;
  isPublic: boolean;
  language: string;
  createdAt: string;
}

export interface SearchResults {
  users: SearchUser[];
  pastes: SearchPaste[];
}
