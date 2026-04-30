import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const [note] = await sql`SELECT * FROM notes WHERE id = ${id}`;
    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }
    return Response.json(note);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { title, content, category } = await request.json();

    // Build dynamic update
    const updates = [];
    const values = [];
    let i = 1;

    if (title !== undefined) {
      updates.push(`title = $${i++}`);
      values.push(title);
    }
    if (content !== undefined) {
      updates.push(`content = $${i++}`);
      values.push(content);
    }
    if (category !== undefined) {
      updates.push(`category = $${i++}`);
      values.push(category);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updates.length === 1) {
      // Only updated_at
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE notes SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`;
    const [note] = await sql(query, values);

    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }
    return Response.json(note);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await sql`DELETE FROM notes WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
