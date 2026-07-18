function BlogSkeleton() {
  return (
    <div className="max-w-7xl mx-auto flex gap-8">
      
      {/* Article Skeleton */}
      <div className="flex-1 animate-pulse">

        {/* Cover Image */}
        <div
          className="
            w-full
            h-[450px]
            rounded-3xl
            bg-zinc-200
            dark:bg-zinc-700
            mb-8
          "
        />

        {/* Tags */}
        <div className="flex gap-3 mb-6">
          <div className="h-8 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700 dark:bg-zinc-700" />
          <div className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700 dark:bg-zinc-700" />
          <div className="h-8 w-28 rounded-full bg-zinc-200 dark:bg-zinc-700 dark:bg-zinc-700" />
        </div>

        {/* Title */}
        <div className="space-y-4 mb-8">
          <div className="h-12 w-4/5 rounded-xl bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-12 w-3/5 rounded-xl bg-zinc-200 dark:bg-zinc-700" />
        </div>

        {/* Description */}
        <div className="space-y-3 mb-10">
          <div className="h-5 w-full rounded-lg bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-5 w-5/6 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
        </div>

        {/* Meta */}
        <div className="flex gap-6 mb-10">
          <div className="h-5 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-5 w-28 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>

        {/* Fake Content */}
        <div className="space-y-5">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="h-5 w-full rounded-lg bg-zinc-200 dark:bg-zinc-700"
            />
          ))}
        </div>

        {/* Code Block Skeleton */}
        <div
          className="
            mt-10
            rounded-3xl
            bg-zinc-900
            p-6
          "
        >
          <div className="space-y-3">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="
                  h-4
                  rounded
                  bg-zinc-700
                "
              />
            ))}
          </div>
        </div>

        {/* More Content */}
        <div className="mt-10 space-y-5">
          {[...Array(12)].map((_, index) => (
            <div
              key={index}
              className="h-5 w-full rounded-lg bg-zinc-200 dark:bg-zinc-700"
            />
          ))}
        </div>
      </div>

      {/* TOC Skeleton */}
      <div className="hidden xl:block w-80 shrink-0">
        <div
          className="
            sticky
            top-6
            rounded-2xl
            border
            border-zinc-200
            dark:border-zinc-700
            bg-white
            dark:bg-zinc-800
            p-5
            animate-pulse
          "
        >
          <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-700 rounded mb-6" />

          <div className="space-y-3">
            {[...Array(12)].map((_, index) => (
              <div
                key={index}
                className="
                  h-4
                  bg-zinc-200 dark:bg-zinc-700
                  rounded
                "
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default BlogSkeleton;