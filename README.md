# Embedded Systems Engineer Portfolio

An interactive, 3D portfolio website for showcasing embedded systems engineering skills, inspired by Bruno Simon's 3D portfolio but themed around microcontrollers and electronic components.

## Features

- Interactive 3D environment with microcontrollers, components, and circuit boards
- Realistic embedded systems components with interactive tooltips
- Dynamic data transfer visualizations between components
- Responsive design that works on desktop and mobile devices
- Sections for About, Skills, Projects, Experience, and Contact

## Technical Overview

This portfolio uses the following technologies:

- Three.js for 3D rendering and interactive graphics
- Modern ES6+ JavaScript
- Responsive CSS for all device sizes
- No frameworks or build tools required - runs directly in the browser

## Local Development

To run this site locally:

1. Clone this repository:
   ```
   git clone https://github.com/AnanthashayanS/AnanthashayanS.github.io.git
   cd AnanthashayanS.github.io
   ```

2. Start a local server. You can use any of these methods:
   - Using Python: `python -m http.server`
   - Using Node.js: `npx serve`
   - Using VS Code's Live Server extension

3. Open your browser and navigate to the local server address (typically http://localhost:8000 or similar)

## Deployment on GitHub Pages

This site is designed to be hosted on GitHub Pages:

1. Push your changes to the `main` branch of your repository
2. Go to the repository settings on GitHub
3. Navigate to the "Pages" section
4. Select the `main` branch as the source
5. Your site will be available at `https://[your-username].github.io/`

## Customization

To personalize this portfolio:

1. Update the content in `index.html` with your own information
2. Modify the 3D components in `src/world.js` to showcase your specific expertise
3. Add your own projects and experience in the respective sections
4. Customize the color scheme in `styles/main.css`

## Future Enhancements

Planned improvements:

- Additional interactive embedded systems components
- More complex animations and interactions
- Downloadable resume function
- Dynamic project showcases with embedded demos
- Integration with Bluetooth API for mobile devices

## Credits

- 3D portfolio concept inspired by [Bruno Simon](https://bruno-simon.com/)
- Built with [Three.js](https://threejs.org/)

## License

MIT License