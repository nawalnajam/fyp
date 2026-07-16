import connectDB from "@/lib/db";
import Booking from "@/models/Booking";

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const booking = await Booking.create(body);
  return Response.json({ success: true, booking });
}
