import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// PATCH /api/bids/:bidId/hire - Hire a freelancer (atomic update)
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bidId } = params;

    // Use transaction with row-level locking to prevent race conditions
    const result = await sql.transaction(async (txn) => {
      // Lock the gig row and check status atomically
      const bidResult = await txn`
        SELECT b.id, b.gig_id, b.status as bid_status, g.owner_id, g.status as gig_status
        FROM bids b
        JOIN gigs g ON b.gig_id = g.id
        WHERE b.id = ${bidId}
        FOR UPDATE OF g
      `;

      if (bidResult.length === 0) {
        throw new Error("Bid not found");
      }

      const bid = bidResult[0];

      // Verify ownership
      if (bid.owner_id !== session.user.id) {
        throw new Error("Not authorized");
      }

      // Check if gig is still open (prevents race condition)
      if (bid.gig_status !== "open") {
        throw new Error("Gig is no longer available");
      }

      // Check if bid is still pending
      if (bid.bid_status !== "pending") {
        throw new Error("Bid is no longer pending");
      }

      // Perform all updates atomically
      await txn`UPDATE bids SET status = 'hired' WHERE id = ${bidId}`;
      await txn`UPDATE bids SET status = 'rejected' WHERE gig_id = ${bid.gig_id} AND id != ${bidId} AND status = 'pending'`;
      await txn`UPDATE gigs SET status = 'assigned' WHERE id = ${bid.gig_id}`;

      return [{ success: true, gig_id: bid.gig_id }];
    });

    return Response.json({
      success: true,
      message: "Freelancer hired successfully",
      gigId: result[0].gig_id,
    });
  } catch (error) {
    console.error("Error hiring freelancer:", error);

    // Return specific error messages
    if (error.message === "Bid not found") {
      return Response.json({ error: "Bid not found" }, { status: 404 });
    }
    if (error.message === "Not authorized") {
      return Response.json(
        { error: "Not authorized to hire for this gig" },
        { status: 403 },
      );
    }
    if (error.message === "Gig is no longer available") {
      return Response.json(
        { error: "This gig has already been assigned" },
        { status: 409 },
      );
    }
    if (error.message === "Bid is no longer pending") {
      return Response.json(
        { error: "This bid has already been processed" },
        { status: 409 },
      );
    }

    return Response.json(
      { error: "Failed to hire freelancer" },
      { status: 500 },
    );
  }
}
