function TechBadge({ children }) {
return ( <span
   className="
     px-4
     py-2
     rounded-full
     border
     border-zinc-300
     dark:border-zinc-600
     dark:text-zinc-300
     text-sm
     font-medium
     hover:bg-[#fbbf24]
     hover:text-zinc-900
     hover:border-[#fbbf24]
     transition-all
     duration-300
   "
 >
{children} </span>
);
}

export default TechBadge;
