import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET /api/bids/notifications - Get bid status updates for the current user
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all bids for this freelancer with their current status
    const bids = await sql`
      SELECT 
        b.id,
        b.gig_id,
        b.status,
        b.created_at,
        g.title as gig_title
      FROM bids b
      JOIN gigs g ON b.gig_id = g.id
      WHERE b.freelancer_id = ${userId}
      ORDER BY b.created_at DESC
    `;

    return Response.json({ bids });
  } catch (error) {
    console.error("Error fetching bid notifications:", error);
    return Response.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}
