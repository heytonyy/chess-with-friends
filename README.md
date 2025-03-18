# Chess React App

A mobile chess application built with React Native and Expo where you can play against friends or challenge a computer opponent.

## Features

- [Progress] Challenge the computer at different difficulty levels
- [Future] Online multiplayer
- [Future] Save and review past games
- [Future] Chess puzzles

## Technologies Used

- React Native
- Expo
- Firebase

## Installation

```bash
# Clone the repository
git clone https://github.com/heytonyy/chess-react-app.git

# Navigate to the project directory
cd chess-react-app

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

## Development Status

This app is currently under development. Below is the implementation roadmap:

- [x] Chess board UI
- [x] Chess piece movement logic
- [x] Game state management
- [ ] Computer opponent AI
- [ ] Local multiplayer functionality
- [ ] User interface and styling
- [ ] Settings and preferences

## Project Structure

```
chess-react-app/
├── app/         
├────── (play)/        # Reusable UI components
├────── components/    # Reusable UI components
├────── constants/     # Constants values (Color Pallette)
├────── context/       # Context componets
├────── hooks/         # React use Hooks
├────── types/         # App types
├────── utils/         # Utility functions
├────── _layout.tsx    # RootLayout
├────── index.tsx      # Index page to redirect to login/play
├────── login.tsx      # Login and Auth Screen
└── assets/            # Images, fonts, and other static assets
```

## Contributing

Instructions for contributing to the project will be added as development progresses.

## License

MIT License - Feel free to use this code however you'd like for your own projects.
