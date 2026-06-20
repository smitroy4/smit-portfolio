import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";

import Prism from "prismjs";

import "prismjs/components/prism-java";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-css";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-properties";

function CodeBlock({
  children,
  language = "text",
}) {
  const [copied, setCopied] = useState(false);

  const code = String(children).replace(/\n$/, "");

  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative my-6">
      <button
        onClick={copyToClipboard}
        className="
          absolute
          top-3
          right-3
          flex
          items-center
          gap-1
          px-3
          py-1
          rounded-md
          text-xs
          border
          bg-zinc-800
          text-white
          hover:bg-zinc-700
          transition
          z-10
        "
      >
        {copied ? (
          <>
            <Check size={14} />
            Copied
          </>
        ) : (
          <>
            <Copy size={14} />
            Copy
          </>
        )}
      </button>

      <pre
        className="
          overflow-x-auto
          rounded-3xl
        "
      >
        <code
          className={`language-${language}`}
        >
          {code}
        </code>
      </pre>
    </div>
  );
}

export default CodeBlock;