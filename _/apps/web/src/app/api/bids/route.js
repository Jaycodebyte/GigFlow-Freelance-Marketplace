import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// POST /api/bids - Submit a bid for a gig
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { gigId, message, price } = body;

    if (!gigId || !message || !price) {
      return Response.json(
        { error: "Gig ID, message, and price are required" },
        { status: 400 },
      );
    }

    // Check if gig exists and is open
    const gigResult = await sql(
      `SELECT id, status, owner_id FROM gigs WHERE id = $1`,
      [gigId],
    );

    if (gigResult.length === 0) {
      return Response.json({ error: "Gig not found" }, { status: 404 });
    }

    if (gigResult[0].status !== "open") {
      return Response.json(
        { error: "This gig is no longer accepting bids" },
        { status: 400 },
      );
    }

    if (gigResult[0].owner_id === session.user.id) {
      return Response.json(
        { error: "You cannot bid on your own gig" },
        { status: 400 },
      );
    }

    // Check if user already bid on this gig
    const existingBid = await sql(
      `SELECT id FROM bids WHERE gig_id = $1 AND freelancer_id = $2`,
      [gigId, session.user.id],
    );

    if (existingBid.length > 0) {
      return Response.json(
        { error: "You have already submitted a bid for this gig" },
        { status: 400 },
      );
    }

    const result = await sql(
      `INSERT INTO bids (gig_id, freelancer_id, message, price, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, gig_id, freelancer_id, message, price, status, created_at`,
      [gigId, session.user.id, message, parseFloat(price), "pending"],
    );

    return Response.json({ bid: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating bid:", error);
    return Response.json({ error: "Failed to create bid" }, { status: 500 });
  }
}
