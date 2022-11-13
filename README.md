# Intro 

This starter kit was created with create-react-app and allows quick setup of a React/p5.js project.

There are two different files available for creating sketches, update App.js to choose the type of sketch you want to create:

## P5Sketch.js

A standard sketch for creating drawings.

## P5SketchWithAudio.js

A sketch for creating animated audio drawings that integrates with the p5.sound and @tonejs/midi libraries. 
This type of sketch allows the triggering of functions to update sketches in sync with audio playback.

# Installing the project

```
git clone https://github.com/LABCAT/react-p5js-starter-project.git new-project
cd new-project
rm .git -rf
rm README.md
yarn install
```

The installation is then complete and you can open it in your browser using:

```
yarn start
```

See the 'scripts' section of package.json for other available npm/yarn commands (including deployment to Github Pages).