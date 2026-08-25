import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

// Who is signed in, for client components. The header reads this instead of
// the root layout reading cookies: a layout that touched auth would opt every
// lesson page out of static rendering.
export async function GET() {
  const user = await getUser();
  return NextResponse.json({ user });
}
