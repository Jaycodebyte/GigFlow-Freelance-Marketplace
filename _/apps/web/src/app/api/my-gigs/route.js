import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET /api/my-gigs - Get gigs posted by the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gigs = await sql(
      `SELECT 
        g.id, 
        g.title, 
        g.description, 
        g.budget, 
        g.owner_id, 
        g.status, 
        g.created_at,
        (SELECT COUNT(*) FROM bids WHERE gig_id = g.id) as bid_count
      FROM gigs g
      WHERE g.owner_id = $1
      ORDER BY g.created_at DESC`,
      [session.user.id],
    );

    return Response.json({ gigs });
  } catch (error) {
    console.error("Error fetching my gigs:", error);
    return Response.json({ error: "Failed to fetch gigs" }, { status: 500 });
  }
}
