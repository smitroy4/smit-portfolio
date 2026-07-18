import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Search,
  FileText,
  FolderGit2,
  BookOpen,
  CornerDownLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Fuse from "fuse.js";

import searchIndex from "../../data/searchIndex";

function SearchModal({
  open,
  onClose,
}) {
  const navigate = useNavigate();

  const inputRef = useRef(null);

  const [query, setQuery] =
    useState("");

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleEsc
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleEsc
      );
  }, [onClose]);

  const fuse = useMemo(
    () =>
      new Fuse(searchIndex, {
        keys: [
          "title",
          "description",
          "keywords",
          "category",
        ],
        threshold: 0.35,
      }),
    []
  );

  const results = useMemo(() => {
    if (!query.trim()) {
      return searchIndex.slice(
        0,
        8
      );
    }

    return fuse
      .search(query)
      .map(
        (result) =>
          result.item
      )
      .slice(0, 12);
  }, [query, fuse]);

  useEffect(() => {
    // setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeys = (e) => {
      if (!open) return;

      if (
        e.key === "ArrowDown"
      ) {
        e.preventDefault();

        setSelectedIndex(
          (prev) =>
            Math.min(
              prev + 1,
              results.length - 1
            )
        );
      }

      if (
        e.key === "ArrowUp"
      ) {
        e.preventDefault();

        setSelectedIndex(
          (prev) =>
            Math.max(
              prev - 1,
              0
            )
        );
      }

      if (
        e.key === "Enter" &&
        results[selectedIndex]
      ) {
        navigate(
          results[selectedIndex]
            .url
        );

        onClose();

        setQuery("");
      }
    };

    window.addEventListener(
      "keydown",
      handleKeys
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeys
      );
  }, [
    open,
    results,
    selectedIndex,
    navigate,
    onClose,
  ]);

  if (!open) return null;

  const getIcon = (type) => {
    switch (type) {
      case "blog":
        return (
          <FileText
            size={18}
          />
        );

      case "project":
        return (
          <FolderGit2
            size={18}
          />
        );

      default:
        return (
          <BookOpen
            size={18}
          />
        );
    }
  };

  const getBadge = (type) => {
    switch (type) {
      case "blog":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300";

      case "project":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300";

      default:
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300";
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        bg-black/40
        backdrop-blur-sm
        flex
        items-start
        justify-center
        pt-[10vh]
        px-4
      "
      onClick={onClose}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="
          w-full
          max-w-3xl
          rounded-3xl
          border
          border-zinc-200
          bg-white
          dark:border-zinc-700
          dark:bg-zinc-800
          shadow-2xl
          overflow-hidden
        "
      >
        {/* Search */}

        <div
          className="
            flex
            items-center
            gap-4
            border-b
            border-zinc-200
            dark:border-zinc-700
            px-6
            h-16
          "
        >
          <Search
            size={20}
            className="text-zinc-400 dark:text-zinc-500"
          />

          <input
            ref={inputRef}
            value={query}
            onChange={(e) =>
              setQuery(
                e.target.value
              )
            }
            placeholder="Search blogs, projects, resources..."
            className="
              flex-1
              outline-none
              text-lg
              dark:bg-transparent
              dark:text-zinc-200
            "
          />
        </div>

        {/* Results */}

        <div
          className="
            max-h-[60vh]
            overflow-y-auto
          "
        >
          {results.map(
            (
              result,
              index
            ) => (
              <button
                key={
                  result.url +
                  index
                }
                onClick={() => {
                  navigate(
                    result.url
                  );

                  onClose();

                  setQuery("");
                }}
                className={`
                  w-full
                  text-left
                  px-5
                  py-4
                  border-b
                  border-zinc-100
                  dark:border-zinc-700
                  transition-all

                  ${
                    index ===
                    selectedIndex
                      ? "bg-zinc-50 dark:bg-zinc-700"
                      : ""
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-zinc-500 dark:text-zinc-400">
                    {getIcon(
                      result.type
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold">
                        {
                          result.title
                        }
                      </h4>

                      <span
                        className={`
                          text-xs
                          px-2
                          py-1
                          rounded-full
                          font-medium
                          ${getBadge(
                            result.type
                          )}
                        `}
                      >
                        {
                          result.type
                        }
                      </span>
                    </div>

                    <p
                      className="
                      text-sm
                      text-zinc-500
                      dark:text-zinc-400
                      line-clamp-2
                      "
                    >
                      {
                        result.description
                      }
                    </p>
                  </div>
                </div>
              </button>
            )
          )}

          {results.length ===
            0 && (
            <div
              className="
                py-16
                text-center
              "
            >
              <Search
                size={40}
              className="
                mx-auto
                text-zinc-300
                dark:text-zinc-600
                mb-4
                "
              />

              <h3 className="font-semibold">
                No Results Found
              </h3>

              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                Try a different
                search term.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}

        <div
          className="
            h-12
            px-5
            border-t
            border-zinc-200
            dark:border-zinc-700
            flex
            items-center
            justify-between
            text-xs
            text-zinc-500
            dark:text-zinc-400
          "
        >
          <div>
            ↑ ↓ Navigate
          </div>

          <div className="flex items-center gap-1">
            <CornerDownLeft
              size={12}
            />
            Open
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;