import { PrismaAdapter } from "@auth/prisma-adapter";
import type { ExpressAuthConfig } from "@auth/express";
import Facebook from "@auth/express/providers/facebook";
import Google from "@auth/express/providers/google";
import type { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { env } from "./env.js";

const frontendOrigin = env.FRONTEND_URL.split(",")[0]!.trim();

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  basePath: "/api/auth",
  secret: process.env.AUTH_SECRET ?? env.JWT_SECRET,
  trustHost: true,
  providers: [
    Google({ allowDangerousEmailAccountLinking: true }),
    Facebook({ allowDangerousEmailAccountLinking: true }),
  ],
  pages: { signIn: `${frontendOrigin}/login` },
  session: { strategy: "database" },
  callbacks: {
    session({ session, user }) {
      const sessionUser = session.user as typeof session.user & { id: string; role: Role };
      sessionUser.id = user.id;
      sessionUser.role = (user as typeof user & { role: Role }).role;
      return session;
    },
  },
} satisfies ExpressAuthConfig;
