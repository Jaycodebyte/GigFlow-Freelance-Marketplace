import sql from "@/app/api/utils/sql";

// GET /api/gigs/:gigId - Get a specific gig
export async function GET(request, { params }) {
  try {
    const { gigId } = params;

    const result = await sql(
      `SELECT 
        g.id, 
        g.title, 
        g.description, 
        g.budget, 
        g.owner_id, 
        g.status, 
        g.created_at,
        u.name as owner_name,
        u.email as owner_email
      FROM gigs g
      LEFT JOIN auth_users u ON g.owner_id = u.id
      WHERE g.id = $1`,
      [gigId],
    );

    if (result.length === 0) {
      return Response.json({ error: "Gig not found" }, { status: 404 });
    }

    return Response.json({ gig: result[0] });
  } catch (error) {
    console.error("Error fetching gig:", error);
    return Response.json({ error: "Failed to fetch gig" }, { status: 500 });
  }
}
