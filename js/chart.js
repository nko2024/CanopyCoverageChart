const data = [
  {
    year: "2022",
    value: 12273
  },
  {
    year: "2023",
    value: 14254
  },
  {
    year: "2024",
    value: 18275
  },
  {
    year: "2025",
    value: 20328
  }
];

// =====================================
// DIMENSIONS
// =====================================

const margin = { top: 20, right: 20, bottom: 40, left: 50 };
const width = 700 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// =====================================
// SVG
// =====================================

const svg = d3.select("#chart")
  .append("svg")
  .attr(
    "viewBox",
    `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
  )
  .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// =====================================
// TOOLTIP
// =====================================

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip");

// =====================================
// SCALES
// =====================================

const x = d3.scaleBand()
  .domain(data.map(d => d.year))
  .range([0, width])
  .padding(0.25);

const y = d3.scaleLinear()
  .domain([0, 22000])
  .range([height, 0]);

// =====================================
// AXES
// =====================================

// X Axis
svg.append("g")
  .attr("class", "axis")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x));

// Y Axis
svg.append("g")
  .attr("class", "axis")
  .call(
    d3.axisLeft(y)
      .tickValues([0, 5000, 10000, 15000, 20000])
      .tickFormat(d3.format(","))
  );

// =====================================
// TARGET LINE
// =====================================

const target = 20000;

svg.append("line")
  .attr("class", "target-line")

  .attr("x1", 0)
  .attr("x2", width)

  .attr("y1", y(target))
  .attr("y2", y(target))

  .style("stroke", "#16a34a")
  .style("stroke-width", 2.5)
  .style("stroke-dasharray", "6 6")

  .style("opacity", 0)

  .transition()
  .duration(1000)
  .style("opacity", 1);

// Goal Label
svg.append("text")
  .attr("class", "target-label")

  .attr("x", 10)
  .attr("y", y(target) - 10)

  .style("font-size", "13px")

  .style("opacity", 0)

  .text("Goal: 20,000")

  .transition()
  .delay(400)
  .duration(600)
  .style("opacity", 1);

// =====================================
// BARS
// =====================================

const bars = svg.selectAll(".bar")
  .data(data)
  .enter()
  .append("rect")
  .attr("class", "bar")

  .attr("x", d => x(d.year))
  .attr("width", x.bandwidth())

  .attr("y", height)
  .attr("height", 0)

  .attr("rx", 10)
  .attr("ry", 10)

  .attr("fill", d =>
    d.value >= target
      ? "#16a34a"
      : "#2f6ea5"
  );

// Animation
bars.transition()
  .duration(1000)
  .ease(d3.easeCubicOut)

  .attr("y", d => y(d.value))
  .attr("height", d => height - y(d.value));

// =====================================
// VALUE LABELS
// =====================================

svg.selectAll(".value-label")
  .data(data)
  .enter()
  .append("text")
  .attr("class", "value-label")

  .attr("x", d => x(d.year) + x.bandwidth() / 2)

  .attr("y", d => y(d.value) - 12)

  .attr("text-anchor", "middle")

  .style("font-size", "13px")

  .style("opacity", 0)

  .text(d => d.value.toLocaleString())

  .transition()
  .delay(700)
  .duration(500)
  .style("opacity", 1);

// =====================================
// TOOLTIP
// =====================================

bars
  .on("mouseover", function(event, d) {

    tooltip
      .style("opacity", 1)
      .html(`
        <strong>${d.year}</strong><br/>
        Trees Planted: ${d.value.toLocaleString()}
      `);

  })
  .on("mousemove", function(event) {

    tooltip
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 28) + "px");

  })
  .on("mouseout", function() {

    tooltip.style("opacity", 0);

  });
