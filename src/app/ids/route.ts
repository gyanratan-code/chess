// import { type NextRequest } from "next/server";
import * as crypto from 'crypto';

function generateUniqueId(length: number): string {
  if (length <= 0) {
    throw new Error("Length must be a positive integer");
  }
  const bytes = Math.ceil(length / 2);
  const uniqueId = crypto.randomBytes(bytes).toString('hex');
  // Trim
  return uniqueId.slice(0, length);
}
export async function GET() {
  const res= {
    "roomId": generateUniqueId(5),
    "authToken": generateUniqueId(5)
  }
  return Response.json(res);
}