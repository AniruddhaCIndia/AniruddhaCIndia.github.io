// First interactive plot
const trace1 = {
  x: [1, 2, 3, 4, 5],
  y: [2, 6, 3, 8, 5],
  mode: "lines+markers",
  name: "My Data",
};

const layout1 = {
  title: "First Interactive Plot 📈",
  margin: { t: 40, r: 20, b: 40, l: 40 },
  paper_bgcolor: "#020617",
  plot_bgcolor: "#020617",
  font: { color: "#e5e7eb" },
};

Plotly.newPlot("plot1", [trace1], layout1, { responsive: true });

// Second interactive plot (pie chart)
const trace2 = {
  labels: ["A", "B", "C", "D"],
  values: [10, 20, 30, 40],
  type: "pie",
};

const layout2 = {
  title: "Category Breakdown 🥧",
  paper_bgcolor: "#020617",
  font: { color: "#e5e7eb" },
};

Plotly.newPlot("plot2", [trace2], layout2, { responsive: true });

// Footer year (shown in sidebar footer)
document.getElementById("year").textContent = new Date().getFullYear();
