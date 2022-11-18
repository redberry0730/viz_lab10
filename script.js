const margin = { top: 20, left: 50, right: 20, bottom: 20 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

let data;
let reverse = false;
let type = d3.select('#group-by').node().value;

const svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const xScale = d3
  .scaleBand()
  .rangeRound([0, width])
  .paddingInner(0.1);

const yScale = d3.scaleLinear().range([height, 0]);

svg.append('g')
  .attr('class', 'axis x-axis')
  .attr("transform", "translate(0," + height + ")");

svg.append('g')
  .attr('class', 'axis y-axis');

svg.append("text")
    .attr("class", "y-axis-title")
    .attr("text-anchor", "middle")
    .attr('font-size', '12px')
    .attr("y", -10)
    .attr("x", 0)
    .attr("aria-hidden", true);

function update(data, type, reverse){
  data.sort((a, b) => b[type] - a[type]);  
  
  if (reverse){
    data.reverse();
  }
  
  xScale.domain(data.map(d => d.company));
  
  yScale.domain([0, d3.max(data, d => d[type])]);
 
  const bars = svg.selectAll('.bar')
    .data(data, d => d.company);
  
  bars.enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('fill', 'blueviolet')
    .attr('x', d=>xScale(d.company))
    .attr('width', d=>xScale.bandwidth())
  	.attr("height",0)
	  .attr("y",height)
    .merge(bars)
    .transition()
    .delay((d,i) => i*100)
    .duration(1000)
    .attr('x', d=>xScale(d.company))
    .attr('y', d=>yScale(d[type]))
    .attr('height', d=>height-yScale(d[type]))
  
  bars.exit().remove();
  
  const xAxis = d3.axisBottom(xScale);
  
  svg.select('.x-axis')
    .transition()
    .duration(1000)
    .call(xAxis);
  
  const yAxis = d3.axisLeft(yScale);
  
  svg.select('.y-axis')
    .transition()
    .duration(1000)
    .call(yAxis);
  
  d3.select('.y-axis-title')
    .text(type==="stores"? "Stores" : "Billion USD")

  svg
    .selectAll(".axis")
    .attr("aria-hidden", true);

  svg
    .selectAll(".bar")
    .attr("role", "graphics-symbol")
    .attr("aria-roledescription", "bar element")
    .attr("tabindex", 0)
    .attr("aria-label", d => {
      return type === "stores"
        ? `${d.company} has ${
            d.stores} stores worldwide.`
        : `${d.company} earns ${d.revenue} in billion U.S. dollars.`;
    });
    
  d3.select(".chart")
    .select("svg")
    .attr("role", "graphics-document")
    .attr("aria-roledescription", "bar chart")
    .attr("tabindex", 0)
    .attr("aria-label",
      type === "stores"
        ? "Bar chart showing the ranking of coffee house chains worldwide per store."
        : "Bar chart showing the ranking of coffee house chains based on the revenue in billion U.S. dollars."
    );
};

d3.csv("coffee-house-chains.csv", d3.autoType).then(_data => {
  data = _data;
  update(data, type, reverse);
});

d3.select('#group-by').on('change', (event) => {
  type = d3.select('#group-by').node().value;
  update(data, type, reverse);
})

d3.select('#sort-btn').on('click', (event) => {
  reverse = !reverse;
  update(data, type, reverse);
})