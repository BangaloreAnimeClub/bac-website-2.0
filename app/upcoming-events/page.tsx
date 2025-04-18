import { upcomingEventsPosts } from "#site/content";
import { PostItem } from "@/components/post-item";
import { QueryPagination } from "@/components/query-pagination";
import { Tag } from "@/components/tag";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllTags, sortPosts, sortTagsByCount } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BAC · Events",
  description: "Join our events and meetups in Bengaluru!",
};

const POSTS_PER_PAGE = 10;

interface BlogPageProps {
  searchParams: {
    page?: string;
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const currentPage = Number(searchParams?.page) || 1;
  const sortedPosts = sortPosts(upcomingEventsPosts.filter((post) => post.published));
  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);

  const displayPosts = sortedPosts.slice(
    POSTS_PER_PAGE * (currentPage - 1),
    POSTS_PER_PAGE * currentPage
  );

  // const tags = getAllTags(upcomingEventsPosts);
  // const sortedTags = sortTagsByCount(tags);

  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block font-black text-4xl lg:text-5xl">Events</h1>
          <p className="text-xl text-muted-foreground">
            Join our events and meetups in Bengaluru!
          </p>
        </div>
      </div>
      <div className="grid gap-3 mt-8">
        <div className="col-span-12 col-start-1 sm:col-span-8">
          <hr />
          {displayPosts?.length > 0 ? (
            <ul className="flex flex-col">
              {displayPosts.map((post) => {
                const { slug, date, title, description, tags } = post;
                return (
                  <li key={slug}>
                    <PostItem
                      slug={slug}
                      date={date}
                      title={title}
                      description={description}
                      // tags={tags}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-8">
              <p className="text-xl text-muted-foreground">
                Nothing to see here yet!
              </p>
            </div>
          )}
          <QueryPagination
            totalPages={totalPages}
            className="mt-4"
          />
        </div>
      </div>
    </div>
  );
}
