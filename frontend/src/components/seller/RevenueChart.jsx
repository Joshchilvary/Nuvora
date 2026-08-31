import React, { useEffect, useRef } from "react";

export default function RevenueChart({ data }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const bars = chartRef.current?.querySelectorAll(".chart-bar-fill");
    if (!bars) return;

    bars.forEach((bar) => {
      const h = bar.style.height;
      bar.style.height = "0%";
      setTimeout(() => {
        bar.style.height = h;
      }, 100);
    });
  }, [data]);

  return (
    <div className="flex-1 min-h-[140px] md:min-h-[180px] flex items-end justify-between mt-auto">
      <div className="flex w-full justify-between items-end h-full pt-6 md:pt-10">
        {data.map((item) => (
          <div
            key={item.day}
            className="w-[8%] h-full flex flex-col justify-end transition-transform"
          >
            <div className="chart-bar w-full h-full rounded-t-sm">
              <div
                className="chart-bar-fill"
                style={{ height: `${item.value}%` }}
              />
            </div>
            <span className="text-xs text-text-muted text-center mt-2 font-label-sm">
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
