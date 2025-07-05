import { NextRequest, NextResponse } from 'next/server';
import scraper from '@/lib/scraper';

export async function POST(request: NextRequest) {
  let data;
  try {
    data = await request.json();
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Invalid or missing JSON in request body' },
      { status: 400 }
    );
  }
  const { category, webhook } = data;

  if (!category || !webhook) {
    return NextResponse.json(
      { error: 'Missing or invalid data in request body, category and webhook are required' },
      { status: 400 }
    );
  }

  const blog_posts = await scraper(category)
  if (blog_posts[0] !== 'success') {
    return NextResponse.json({ error: blog_posts[0] },{ status: 400 });
  }
  const posts = blog_posts[1];
  return NextResponse.json({ message: 'Valid request received', received: blog_posts[0], posts: posts });
}
