# Chess With Friends

A mobile chess application built with React Native and Expo where you can play against friends, or speculate your friends chess games.

## Features

- [INPROGRESS] Online multiplayer
- [Future] Save and review past games
- [Future] Chess puzzles

## Technologies Used

- React Native
- Expo
- Firebase

## Installation

```bash
# Clone the repository
git clone https://github.com/heytonyy/chess-with-friends.git

# Navigate to the project directory
cd chess-with-friends

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
chess-with-friends/
├── app/         
├────── (play)/        # Play Screen after auth
├────── components/    # Reusable UI components
├────── config/        # Configuration files (Firebase)
├────── constants/     # Constants values (Color Pallette)
├────── context/       # Frontend GameContext
├────── hooks/         # React use Hooks
├────── services/      # Service function 
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
