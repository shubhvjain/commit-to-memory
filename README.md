## Setup notes

- This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.0.1.
- Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
- Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.
- Source of the Brain Image (in the icon)  : https://pixabay.com/illustrations/brain-lobes-neurology-human-body-1007686/

## Notes

When the app loads, only the app module is loaded.
The main module is the home page where links other pages are displayed.
Modules are lazy-loaded when the user navigates from the home page.

There are 3  main modules in the project:
- `core` : this has the main functionality: creating flashcards and reviewing them 
- `settings`: all user configurable settings. like flashcard types, review systems
- `plugins`: additional features. like statistics, searching flashcards, creating quizzes 

## Storing data

Assuming all data is accessed via REST API. The API is just to store data. All logic is implemented in the project. 