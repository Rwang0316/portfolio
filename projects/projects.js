import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

let selectedIndex = -1;

console.log(projects);

const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;

const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

function renderPieChart(projectsGiven) {
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);

  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();

  arcs.forEach((arc, idx) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .attr('class', idx === selectedIndex ? 'selected' : '')
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        updateUI(projectsGiven);
      });
  });

  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', `legend-item ${idx === selectedIndex ? 'selected' : ''}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        updateUI(projectsGiven);
      });
  });
}

function updateUI(baseProjects) {
  let filtered = baseProjects;

  if (selectedIndex !== -1) {
    let rolled = d3.rollups(
      baseProjects,
      (v) => v.length,
      (d) => d.year
    );

    let selectedYear = rolled[selectedIndex][0];

    filtered = baseProjects.filter((p) => p.year === selectedYear);
  }

  renderProjects(filtered, projectsContainer, 'h2');
  renderPieChart(baseProjects);
}

renderPieChart(projects);

let query = '';
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = event.target.value;

  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  selectedIndex = -1;

  updateUI(filteredProjects);
});