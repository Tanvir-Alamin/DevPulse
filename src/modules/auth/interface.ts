export interface ISignUpUser {
  name: string;
  email: string;
  password: string;
  role?: "contributor" | "maintainer";
  created_at?: string;
  updated_at?: string;
}
export interface ILoginUser {
  email: string;
  password: string;
}
