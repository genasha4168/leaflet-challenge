//----------------------------------------------------------------------------------------------------------------
// Leaflet-Part-1 - Earthquake Map
//----------------------------------------------------------------------------------------------------------------

// Initialize the map
let map = L.map('map').setView([20, 0], 2);

// Base layers
let streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

let satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  attribution: '&copy; Google Maps'
});

let grayscaleLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
  subdomains: 'abcd',
  maxZoom: 19
});

// Add default street layer
streetLayer.addTo(map);

// Layer control
let baseMaps = {
  "Street View": streetLayer,
  "Satellite View": satelliteLayer,
  "Grayscale": grayscaleLayer
};
L.control.layers(baseMaps).addTo(map);

// Function to get color based on depth
function getDepthColor(depth) {
  if (depth >= 90) return "red";
  if (depth >= 70) return "orangered";
  if (depth >= 50) return "orange";
  if (depth >= 30) return "gold";
  if (depth >= 10) return "yellow";
  return "green";
}

// Fetch and display earthquake data
fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
  .then(res => res.json())
  .then(data => {
    data.features.forEach(eq => {
      let coords = eq.geometry.coordinates;
      let depth = coords[2];
      let magnitude = eq.properties.mag;
      let place = eq.properties.place;

      let marker = L.circleMarker([coords[1], coords[0]], {
        radius: magnitude * 2,
        fillColor: getDepthColor(depth),
        color: "#000",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.8
      });

      marker.bindPopup(`<strong>Magnitude:</strong> ${magnitude}<br><strong>Location:</strong> ${place}<br><strong>Depth:</strong> ${depth} km`);
      marker.addTo(map);
    });
  })

  // Add legend to bottom right
  let legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  let div = L.DomUtil.create('div', 'info legend');
  let depths = [0, 10, 30, 50, 70, 90];
  let labels = [];

  for (let i = 0; i < depths.length; i++) {
    let from = depths[i];
    let to = depths[i + 1];
    let color = getDepthColor(from);

    labels.push(
      `<i style="background:${color}; width: 12px; height: 12px; display:inline-block; margin-right:6px;"></i> 
      ${from}${to ? '&ndash;' + to : '+'} km`
    );
  }

  div.innerHTML = '<strong>Depth</strong><br>' + labels.join('<br>');
  div.style.background = 'white';
  div.style.padding = '8px';
  div.style.fontSize = '14px';
  div.style.lineHeight = '18px';
  div.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
  return div;
};

legend.addTo(map);

