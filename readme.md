# MovieDB

A web application for discovering, browsing, and managing movies and TV shows. Users can search titles, view detailed information, manage a personal watchlist, and explore trending content. The application is built with **Vite**, **React**, **TypeScript**, and **Tailwind CSS**, and integrates with **TMDB** and **OMDB** APIs.

---

## Features

* **Search** for movies and TV shows with real-time results and debounced input.
* **Detailed view pages** for each title including:

  * Plot summary
  * Cast & crew
  * Ratings (TMDB, IMDb, Rotten Tomatoes, Metacritic)
  * Poster and backdrop images
* **Watchlist management** stored in `localStorage`.
* **Trending dashboard** with genre filters.
* **Filtering options** for year, rating, runtime, and genre.
* **Recommendations** based on user preferences.
* **Dark and light themes** with persistent toggle.
* **Responsive layout** optimized for mobile and desktop.

---

## Technologies Used

* [Vite](https://vitejs.dev/)
* [React](https://reactjs.org/)
* [TypeScript](https://www.typescriptlang.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [TMDB API](https://www.themoviedb.org/documentation/api)
* [OMDB API](https://www.omdbapi.com/)

---

## Setup Instructions

### Prerequisites

* Node.js and npm installed

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/movie-discovery-app.git
   cd movie-discovery-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your API keys:

   ```env
   VITE_TMDB_API_KEY=your_tmdb_key
   VITE_OMDB_API_KEY=your_omdb_key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   [http://localhost:5173](http://localhost:5173)

---

## Folder Structure

```
src/
├── components/        // Reusable UI and layout components
├── context/           // App and theme context
├── hooks/             // Custom hooks (e.g. useDebounce, useWatchlist)
├── pages/             // Main route views
├── services/          // API integrations for TMDB, OMDB, storage
├── types/             // TypeScript type definitions
├── App.tsx            // Main app component
├── main.tsx           // App entry point
```


## Development Notes

* **State Management**: React Context + custom hooks
* **Watchlist Persistence**: LocalStorage
* **Theming**: `darkMode: 'class'` via Tailwind with user/system preference detection
* **Performance**: Debounced search, API caching, and pagination support
* **Accessibility**: Proper focus states, ARIA labels, and mobile keyboard handling

---

## License

This project is licensed under the [MIT License](LICENSE).

