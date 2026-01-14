import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET /api/bids/gig/:gigId - Get all bids for a specific gig (Owner only)
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gigId } = params;

    // Verify that the user is the owner of the gig
    const gigResult = await sql(`SELECT id, owner_id FROM gigs WHERE id = $1`, [
      gigId,
    ]);

    if (gigResult.length === 0) {
      return Response.json({ error: "Gig not found" }, { status: 404 });
    }

    if (gigResult[0].owner_id !== session.user.id) {
      return Response.json(
        { error: "You are not authorized to view these bids" },
        { status: 403 },
      );
    }

    const bids = await sql(
      `SELECT 
        b.id, 
        b.gig_id, 
        b.freelancer_id, 
        b.message, 
        b.price, 
        b.status, 
        b.created_at,
        u.name as freelancer_name,
        u.email as freelancer_email
      FROM bids b
      LEFT JOIN auth_users u ON b.freelancer_id = u.id
      WHERE b.gig_id = $1
      ORDER BY b.created_at ASC`,
      [gigId],
    );

    return Response.json({ bids });
  } catch (error) {
    console.error("Error fetching bids:", error);
    return Response.json({ error: "Failed to fetch bids" }, { status: 500 });
  }
}
