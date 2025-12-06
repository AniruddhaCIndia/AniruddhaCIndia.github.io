// Simple interactive plot with Plotly
const trace = {
  x: [1, 2, 3, 4, 5],
  y: [2, 6, 3, 8, 5],
  mode: "lines+markers",
  name: "My Data",
};

const layout = {
  title: "First Interactive Plot 📈",
  margin: { t: 40, r: 20, b: 40, l: 40 },
  paper_bgcolor: "#020617",
  plot_bgcolor: "#020617",
  font: { color: "#e5e7eb" },
};

Plotly.newPlot("plot", [trace], layout, { responsive: true });

// Set footer year
document.getElementById("year").textContent = new Date().getFullYear();
