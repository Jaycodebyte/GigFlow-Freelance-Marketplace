import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET /api/gigs - Fetch all open gigs with optional search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let query;
    let params = [];

    if (search && search.trim().length > 0) {
      query = `
        SELECT 
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
        WHERE g.status = $1 
        AND (LOWER(g.title) LIKE LOWER($2) OR LOWER(g.description) LIKE LOWER($2))
        ORDER BY g.created_at DESC
      `;
      params = ["open", `%${search}%`];
    } else {
      query = `
        SELECT 
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
        WHERE g.status = $1
        ORDER BY g.created_at DESC
      `;
      params = ["open"];
    }

    const gigs = await sql(query, params);
    return Response.json({ gigs });
  } catch (error) {
    console.error("Error fetching gigs:", error);
    return Response.json({ error: "Failed to fetch gigs" }, { status: 500 });
  }
}

// POST /api/gigs - Create a new gig
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, budget } = body;

    if (!title || !description || !budget) {
      return Response.json(
        { error: "Title, description, and budget are required" },
        { status: 400 },
      );
    }

    const result = await sql(
      `INSERT INTO gigs (title, description, budget, owner_id, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, description, budget, owner_id, status, created_at`,
      [title, description, parseFloat(budget), session.user.id, "open"],
    );

    return Response.json({ gig: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating gig:", error);
    return Response.json({ error: "Failed to create gig" }, { status: 500 });
  }
}
