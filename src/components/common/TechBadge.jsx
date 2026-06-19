function TechBadge({ children }) {
return ( <span
   className="
     px-4
     py-2
     rounded-full
     border
     border-zinc-300
     text-sm
     font-medium
     hover:bg-blue-600
     hover:text-white
     hover:border-blue-600
     transition-all
     duration-300
   "
 >
{children} </span>
);
}

export default TechBadge;
