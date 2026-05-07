console.log("LOADING TREE PLANTING DATA");

const margin = { top: 20, right: 20, bottom: 50, left: 70 };
const width = 700 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// SVG
const svg = d3.select("#chart")
  .append("svg")
  .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip");

// ArcGIS Open Data URL
const url = "https://services.arcgis.com/rYz782eMbySr2srL/arcgis/rest/services/Trees_Planted/FeatureServer/19/query?outFields=*&where=1%3D1&f=geojson";

d3.json(url)
  .then(geoData => {

    console.log("RAW DATA:", geoData);

    // Convert ArcGIS features into chart data
    const data = geoData.features.map(feature => {

      const props = feature.properties;

      return {
        year: String(props.YEAR).replace(/,/g, ""),
        value: +String(props.TREES_PLANTED).replace(/,/g, "")
      };

    });

    // Sort chronologically
    data.sort((a, b) => a.year - b.year);

    console.log("PROCESSED DATA:", data);

    renderChart(data);

  })
  .catch(error => {
    console.error("DATA LOAD FAILED:", error);
  });

function renderChart(data) {

  // Scales
  const x = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .nice()
    .range([height, 0]);

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
        .tickFormat(d3.format(","))
    );

  // Bars
  const bars = svg.selectAll(".bar")
  .data(data)
  .enter()
  .append("rect")
  .attr("class", "bar")
  .attr("x", d => x(d.year))
  .attr("width", x.bandwidth())
  .attr("y", height)
  .attr("height", 0)

  // Rounded corners
  .attr("rx", 10)
  .attr("ry", 10)

  .attr("fill", "#2f6ea5");

  // Animation
  bars.transition()
    .duration(1200)
    .ease(d3.easeCubicOut)
    .attr("y", d => y(d.value))
    .attr("height", d => height - y(d.value));

  // Tooltips
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

 // Value labels
svg.selectAll(".label")
  .data(data)
  .enter()
  .append("text")
  .attr("class", "label")
  .attr("x", d => x(d.year) + x.bandwidth() / 2)
  .attr("y", d => y(d.value) - 14)
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .style("font-weight", "700")
  .style("fill", "#334155")
  .style("opacity", 0)
  .text(d => d.value.toLocaleString())
  .transition()
  .delay(800)
  .duration(500)
  .style("opacity", 1);

}
