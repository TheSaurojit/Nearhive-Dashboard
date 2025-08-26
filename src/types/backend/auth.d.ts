export type AuthContextType = {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

export type AuthUser = {
    id : string ,
    email : string ,
    role : "admin" 
}