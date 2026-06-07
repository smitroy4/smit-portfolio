import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div
      className="
        min-h-[70vh]
        flex
        flex-col
        justify-center
        items-center
        text-center
      "
    >
      <h1 className="text-8xl font-bold">
        404
      </h1>

      <p className="mt-4 text-zinc-500">
        The page you're looking for
        doesn't exist.
      </p>

      <Link
        to="/"
        className="
          mt-8
          px-5
          py-3
          rounded-xl
          bg-blue-600
          text-white
        "
      >
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;