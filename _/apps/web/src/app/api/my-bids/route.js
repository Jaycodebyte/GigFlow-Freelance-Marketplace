import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET /api/my-bids - Get bids submitted by the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
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
        g.title as gig_title,
        g.description as gig_description,
        g.budget as gig_budget,
        g.status as gig_status
      FROM bids b
      JOIN gigs g ON b.gig_id = g.id
      WHERE b.freelancer_id = $1
      ORDER BY b.created_at DESC`,
      [session.user.id],
    );

    return Response.json({ bids });
  } catch (error) {
    console.error("Error fetching my bids:", error);
    return Response.json({ error: "Failed to fetch bids" }, { status: 500 });
  }
}
