export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  connectedServices: {
    id: string;
    name: string;
    connected: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }[];
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}
