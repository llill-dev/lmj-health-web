export type Role = "patient" | "doctor" | "secretary" | "admin" | "data-entry";

export interface UserClaims {
  sub: string;
  role: Role;
  name?: string;
  exp?: number;
}
