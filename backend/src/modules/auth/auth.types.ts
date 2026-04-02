export type AppRole = "admin" | "manager" | "sales";

export type JwtPayload = {
  sub: string;
  workspaceId: string;
  role: AppRole;
  tokenId: string;
  type: "access";
};

