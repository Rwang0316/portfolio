import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

console.log(projects);

const projectsTitle = document.querySelector('.projects-title');

projectsTitle.textContent = `${projects.length} Projects`;

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

