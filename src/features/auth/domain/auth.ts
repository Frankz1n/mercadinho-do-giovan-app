export type UserRole = 'customer' | 'admin';

export type AppUser = Readonly<{
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}>;
