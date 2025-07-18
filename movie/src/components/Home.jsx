import { useState, useEffect } from "react";
import { useDebounce } from "react-use";
import Search from "./Search.jsx";
import MovieCard from "./MovieCard.jsx";
import { getTrendingMovies, updateSearchCount } from "../appwrite.js";
import InfiniteScroll from "react-infinite-scroll-component";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(null);
  const [filters, setFilters] = useState({
    genre: "",
    year: "",
    rating: "",
  });

  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );

  const fetchMovies = async (query = "", page = 1, appendResults = false) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(
            query
          )}&sort_by=popularity.desc&include_adult=false&page=${page}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&include_adult=false&page=${page}`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(
          data.Error || "An error occurred while fetching movies."
        );
        if (!appendResults) setMovieList([]);
        return;
      }

      // 👇 Append if loading more pages
      setMovieList((prev) =>
        appendResults ? [...prev, ...(data.results || [])] : data.results || []
      );

      setTotalPages(data.total_pages);

      // Only update search count for the first page of a search
      if (query && data.results.length > 0 && page === 1) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Failed to fetch movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      setErrorMessage(
        "Failed to fetch trending movies. Please try again later."
      );
    }
  };

  const filteredMovies = movieList.filter((movie) => {
    const matchesGenre = filters.genre
      ? movie.genre_ids.includes(parseInt(filters.genre))
      : true;
    const matchesYear = filters.year
      ? movie.release_date?.startsWith(filters.year)
      : true;
    const matchesRating = filters.rating
      ? movie.vote_average >= parseFloat(filters.rating)
      : true;
    return matchesGenre && matchesYear && matchesRating;
  });
  const loadMoreMovies = async () => {
    const nextPage = page + 1;

    if (totalPages && nextPage > totalPages) {
      setHasMore(false);
      return;
    }

    await fetchMovies(debouncedSearchTerm, nextPage, true); // true to append
    setPage(nextPage);
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchMovies(debouncedSearchTerm, 1, false);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);
  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="/hero-img.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <Link to={`/movie/${movie.movie_id}`}>
                  {" "}
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                </Link>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/80 backdrop-blur-md border border-gray-700 p-6 rounded-2xl mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xl">
            {/* Genre */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Genre
              </label>
              <select
                className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={filters.genre}
                onChange={(e) =>
                  setFilters({ ...filters, genre: e.target.value })
                }
              >
                <option value="">All</option>
                <option value="28">Action</option>
                <option value="35">Comedy</option>
                <option value="18">Drama</option>
                <option value="27">Horror</option>
                <option value="16">Animation</option>
                <option value="878">Sci-Fi</option>
                <option value="53">Thriller</option>
              </select>
            </div>

            {/* Release Year */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Release Year
              </label>
              <input
                type="number"
                placeholder="e.g. 2023"
                className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: e.target.value })
                }
              />
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Min Rating
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="e.g. 7.5"
                className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={filters.rating}
                onChange={(e) =>
                  setFilters({ ...filters, rating: e.target.value })
                }
              />
            </div>
          </div>

          <button
            onClick={() => setFilters({ genre: "", year: "", rating: "" })}
            className="mt-4 text-sm font-medium px-4 py-2 rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-200 shadow-md w-max mx-auto"
          >
            Clear Filters
          </button>

          {errorMessage && (
            <p className="text-red-500 error-message">{errorMessage}</p>
          )}

          {isLoading && movieList.length === 0 ? (
            <div className="spinner"></div>
          ) : (
            <InfiniteScroll
              dataLength={movieList.length}
              next={loadMoreMovies}
              hasMore={hasMore}
              loader={
                <div className="flex justify-center my-4">
                  <p className="text-yellow-400">Loading more movies...</p>
                </div>
              }
              endMessage={
                <p className="text-gray-400 text-center my-6">
                  No more movies to load.
                </p>
              }
              scrollThreshold={0.9}
            >
              <ul>
                {filteredMovies.map((movie, index) => (
                  <MovieCard key={`${movie.id}-${index}`} movie={movie} />
                ))}
              </ul>
            </InfiniteScroll>
          )}

          <div className="lgo-img">
            <img src="/bg-1.jpg" alt="Hero Banner" />
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
