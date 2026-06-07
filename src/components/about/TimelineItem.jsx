function TimelineItem({ item }) {
  return (
    <div className="flex gap-6">
      <div className="w-20 shrink-0">
        <span className="font-semibold text-blue-600">
          {item.year}
        </span>
      </div>

      <div className="flex-1 border-l border-zinc-200 pl-6 pb-10">
        <h3 className="font-semibold text-lg mb-2">
          {item.title}
        </h3>

        <p className="text-zinc-600 leading-relaxed">
          {item.description}
        </p>
      </div>
    </div>
  );
}

export default TimelineItem;