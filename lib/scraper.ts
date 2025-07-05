import { JSDOM } from 'jsdom';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import pLimit from 'p-limit';

type BlogInfo = {
  title: string;
  category: string;
  author: string;
  reading_time: string;
  published_date: string;
};
type Category = { [key: string]: { category_path: string } };

const BASE_URL = 'https://xepelin.com';
const ALLOWED_CATEGORIES = ['all']
const LIMIT = pLimit(5);

export default async function scraper(category: string): Promise<[string, BlogInfo[]]> {
  const all_categories = await getCategories();
  if (!Object.keys(all_categories).length) return ['error: connection error, try again', []];
  ALLOWED_CATEGORIES.push(...Object.keys(all_categories));
  if (!ALLOWED_CATEGORIES.includes(category.toLowerCase())) return ['error: category not found', []];
  const posts = await getBlogPostsForCategory(category, all_categories);
  if (!posts.length) return ['error: connection error, try again', []];
  return ['success', posts]
}

// private async

async function getCategories(): Promise<Category> {
  const categories: Category = {};
  try {
    const res = await fetch(`${BASE_URL}/blog`);
    const html = await res.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const header = document.querySelector('header');
    if (!header) return {};

    const blog_links = header.querySelectorAll('a[href]');
    const base_domain = new URL(BASE_URL).hostname;

    for (const link of Array.from(blog_links)) {
      const href = link.getAttribute('href');
      if (!href) continue;

      const full_url = new URL(href, BASE_URL);
      const path = full_url.pathname;

      const is_same_domain = full_url.hostname === base_domain;
      const is_blog_category = /^\/blog\/[^/]+$/.test(path);

      if (is_same_domain && is_blog_category) {
        const name = link.textContent?.trim() || path;
        const parsed_name = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        categories[parsed_name] = { category_path: path };
      }
    }
  } catch { return {} }

  return categories;
}

async function getBlogPostsForCategory(category_name: string, mapped_categories: Category): Promise<BlogInfo[]> {
  if (category_name === "all") {
    const allResults = await Promise.all(
      Object.keys(mapped_categories).map(single_category =>
        getBlogPostsForCategory(single_category, mapped_categories)
      )
    );
    return allResults.flat();
  }

  const slug = mapped_categories[category_name].category_path;
  const post_url = `${BASE_URL}${slug}`;
  const articles = await fetchArticlesViaNetwork(slug);

  const result = await Promise.all(
    articles.map(article => LIMIT(async () => {
      const title = article.title?.trim() || '';
      const category = category_name;
      const author = article.author?.name?.trim() || '';
      const slug = article.slug?.current?.trim() || '';
      const published_date = article._createdAt || '';
      const fullUrl = `${post_url}/${slug}`;
      const reading_time = await getReadingTime(fullUrl);
      return { title, category, author, reading_time, published_date };
    }))
  );

  return result;
}

async function getReadingTime(url: string): Promise<string> {
  let reading_time = '';
  try {
    const res = await fetch(url);
    const html = await res.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const candidates = Array.from(document.querySelectorAll('div[class*="Text_body__"]'));
    reading_time = candidates
      .find(div => div.textContent?.toLowerCase().includes('min de lectura'))
      ?.textContent?.trim() || '';
  } catch { reading_time = '' }
  return reading_time;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchArticlesViaNetwork(categorySlug: string): Promise<any[]> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true
  });
  const page = await browser.newPage();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const api_responses: any[] = [];

  page.on('response', async (response) => {
    const url = response.url();
    const is_api_response = url.includes('apicdn.sanity.io') && url.includes('query=*');
    if (!is_api_response) return;

    try {
      const json = await response.json();
      if (json?.result && Array.isArray(json.result)) {
        api_responses.push(...json.result);
      }
    } catch { return [] }
  });

  await page.goto(`${BASE_URL}${categorySlug}`, { waitUntil: 'networkidle2' });

  const load_more_button = 'button.bg-xindigo-500';

  while (true) {
    const button = await page.$(load_more_button);
    if (!button) break;
    const is_disabled = await page.$eval(load_more_button, btn => btn.hasAttribute('disabled')).catch(() => true);
    if (is_disabled) break;

    await Promise.all([
      page.waitForResponse(response => {
        const url = response.url();
        return url.includes('apicdn.sanity.io') && url.includes('query=*');
      }),
      page.click(load_more_button)
    ]);

    await new Promise(r => setTimeout(r, 200));
  }
  await new Promise(r => setTimeout(r, 1000));

  await browser.close();
  return api_responses;
}
