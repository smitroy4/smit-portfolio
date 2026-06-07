import timeline from "../../data/timeline";

import TimelineItem from "./TimelineItem";

function TimelineSection() {
  return (
    <section className="mb-20">
      <h2 className="text-3xl font-bold mb-10">
        Journey Timeline
      </h2>

      {timeline.map((item) => (
        <TimelineItem
          key={`${item.year}-${item.title}`}
          item={item}
        />
      ))}
    </section>
  );
}

export default TimelineSection;