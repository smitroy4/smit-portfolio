import { motion } from "framer-motion";

function TimelineItem({ item }) {
return (
<motion.div
initial={{
opacity: 0,
x: -30,
}}
whileInView={{
opacity: 1,
x: 0,
}}
viewport={{
once: true,
}}
transition={{
duration: 0.5,
}}
className="flex gap-6"
> <div className="w-20 shrink-0"> <span className="font-semibold text-blue-600">
{item.year} </span> </div>

  <div className="flex-1 border-l border-zinc-200 pl-6 pb-10">
    <h3 className="font-semibold text-lg mb-2">
      {item.title}
    </h3>

    <p className="text-zinc-600 leading-relaxed">
      {item.description}
    </p>
  </div>
</motion.div>

);
}

export default TimelineItem;
