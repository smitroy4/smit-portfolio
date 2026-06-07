import { useState } from "react";
import { Copy, Check } from "lucide-react";

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);

  const code = String(children).replace(/\n$/, "");

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

      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default CodeBlock;