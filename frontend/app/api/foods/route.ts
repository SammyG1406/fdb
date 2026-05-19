import pool from '@/lib/fooddb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length === 0) {
    return Response.json([]);
  }

  try {
    const result = await pool.query(
      `SELECT id, name,
              calories_per_100g AS calories,
              protein_per_100g  AS protein,
              carbs_per_100g    AS carbs,
              fats_per_100g     AS fats,
              fiber_per_100g    AS fiber,
              ts_rank(to_tsvector('english', name), websearch_to_tsquery('english', $1)) AS rank
       FROM foods
       WHERE to_tsvector('english', name) @@ websearch_to_tsquery('english', $1)
       ORDER BY rank DESC
       LIMIT 20`,
      [query.trim()]
    );
    return Response.json(result.rows);
  } catch (error) {
    console.error('Food search error:', error);
    return Response.json({ error: 'Search failed' }, { status: 500 });
  }
}
