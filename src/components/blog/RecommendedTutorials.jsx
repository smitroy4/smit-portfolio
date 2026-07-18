function RecommendedTutorials({ tutorials = [] }) {
  if (!tutorials.length) {
    return null;
  }

  return (
    <div
      className="
        mt-6
        rounded-2xl
        border
        border-zinc-200
        bg-white


        overflow-hidden
      "
    >
      {/* Header */}
      <div
        className="
          px-5
          py-4
          border-b
          border-zinc-200


        "
      >
        <h3
          className="
            text-xs
            uppercase
            tracking-wider
            font-bold
            text-zinc-900

          "
        >
          Recommended Tutorials
        </h3>
      </div>

      {/* Videos */}
      <div className="p-4 space-y-4">
        {tutorials.map((tutorial, index) => (
          <a
            key={index}
            href={`https://www.youtube.com/watch?v=${tutorial.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              group
              block
            "
          >
            {/* Thumbnail */}
            <div
              className="
                relative
                overflow-hidden
                rounded-xl
                border
                border-zinc-200

                bg-zinc-100

              "
            >
              <img
                src={`https://img.youtube.com/vi/${tutorial.videoId}/hqdefault.jpg`}
                alt={tutorial.title}
                className="
                  w-full
                  aspect-video
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-105
                "
                loading="lazy"
              />

              {/* Dark Overlay */}
              <div
                className="
                  absolute
                  inset-0
                  bg-black/10
                  group-hover:bg-black/20
                  transition-colors
                "
              />

              {/* Play Button */}
              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                "
              >
                <div
                  className="
                    h-12
                    w-12
                    rounded-full
                    bg-red-600
                    text-white
                    flex
                    items-center
                    justify-center
                    shadow-lg
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  "
                >
                  ▶
                </div>
              </div>

              {/* Duration */}
              {tutorial.duration && (
                <div
                  className="
                    absolute
                    bottom-2
                    right-2
                    px-2
                    py-1
                    rounded
                    bg-black/80
                    text-white
                    text-xs
                    font-medium
                  "
                >
                  {tutorial.duration}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="mt-3">
              <h4
                className="
                  text-sm
                  font-semibold
                  text-zinc-900

                  leading-snug
                  line-clamp-2
                  group-hover:text-red-600
                  transition-colors
                "
              >
                {tutorial.title}
              </h4>

              <p
                className="
                  mt-1
                  text-xs
                  text-zinc-500

                "
              >
                {tutorial.channel}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default RecommendedTutorials;
