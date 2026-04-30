import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const notes = await sql`SELECT * FROM notes ORDER BY updated_at DESC`;
    return Response.json(notes);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, content, category } = await request.json();
    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }
    const [note] = await sql`
      INSERT INTO notes (title, content, category)
      VALUES (${title}, ${content}, ${category || "Personal"})
      RETURNING *
    `;
    return Response.json(note);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create note" }, { status: 500 });
  }
}
