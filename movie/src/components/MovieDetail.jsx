// src/pages/MovieDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import starIcon from "/star.svg";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const MovieDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/movie/${id}?append_to_response=videos,credits,reviews`,
          API_OPTIONS
        );
        if (!response.ok) throw new Error("Failed to fetch movie details");
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Failed to load movie details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (isLoading) return <div className="spinner my-10 mx-auto"></div>;
  if (errorMessage)
    return <p className="text-red-500 text-center">{errorMessage}</p>;
  if (!movie) return null;

  return (
    <div className="bg-img">
      <div className="max-w-6xl mx-auto px-4 py-10 text-white font-[var(--font-dm-sans)]">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[var(--color-dark-300)] shadow-md hover:shadow-blue-500/40 transition-all duration-200 hover:bg-[var(--color-dark-200)] focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          ← Back
        </button>

        <div className="bg-[var(--color-dark-100)] p-6 rounded-3xl shadow-[0_0_80px_10px_rgba(255,255,255,0.15)] glass">
          <h1 className="text-4xl text-left font-bold mb-2 ml-0 text-white">{movie.title}</h1>
          <div className="flex items-center gap-4 mb-6 text-[var(--color-light-200)] text-sm">
            <span>{movie.release_date?.split("-")[0]}</span>
            <span>•</span>
            <span>{movie.vote_average ? `PG-13` : "NR"}</span>
            <span>•</span>
            <span>
              {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
            </span>
            <span className="flex items-center gap-1 ml-auto text-yellow-400">
              <img src={starIcon} alt="star" className="w-4 h-4" />
              <span>
                {movie.vote_average.toFixed(1)} / 10 (
                {movie.vote_count.toLocaleString()})
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {movie.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="rounded-xl w-full object-cover shadow-lg max-h-[500px] md:col-span-1"
              />
            )}

            {movie.videos?.results?.[0] && (
              <div className="relative w-full h-full aspect-video rounded-xl max-h-[500px] overflow-hidden md:col-span-2">
                <iframe
                  src={`https://www.youtube.com/embed/${movie.videos.results[0].key}`}
                  title="Trailer"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            )}
          </div>

          {movie.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 rounded-full bg-[var(--pink)] text-sm text-white shadow-md hover:shadow-pink-400/50 transition-shadow"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[var(--color-light-100)] mb-2">
              Overview
            </h2>
            <p className="text-[var(--color-light-200)] leading-relaxed">
              {movie.overview}
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 text-[var(--color-light-200)]">
            <div>
              <dt className="font-semibold text-[var(--color-light-100)]">
                Release date
              </dt>
              <dd>{movie.release_date}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--color-light-100)]">
                Status
              </dt>
              <dd>{movie.status}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--color-light-100)]">
                Languages
              </dt>
              <dd>
                {movie.spoken_languages
                  ?.map((lang) => lang.english_name)
                  .join(", ")}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--color-light-100)]">
                Tagline
              </dt>
              <dd className="italic">{movie.tagline || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--color-light-100)]">
                Budget
              </dt>
              <dd>${movie.budget?.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--color-light-100)]">
                Revenue
              </dt>
              <dd>${movie.revenue?.toLocaleString()}</dd>
            </div>
          </dl>

          {movie.homepage && (
            <a
              href={movie.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 bg-[var(--pink)] text-white px-5 py-2 rounded-xl font-medium shadow-md hover:shadow-pink-500/60 transition-shadow"
            >
              Visit Homepage →
            </a>
          )}

          <div className="mt-10">
            <h2 className="text-xl font-semibold text-[var(--color-light-100)] mb-2">
              Top Cast
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[var(--color-light-200)]">
              {movie.credits?.cast?.slice(0, 6).map((actor) => (
                <li key={actor.id} className="text-sm">
                  {actor.name}{" "}
                  <span className="text-gray-400">as {actor.character}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-semibold text-[var(--color-light-100)] mb-2">
              Top Reviews
            </h2>
            {movie.reviews?.results?.length ? (
              <div className="space-y-4">
                {movie.reviews.results.slice(0, 2).map((review) => (
                  <div
                    key={review.id}
                    className="bg-[var(--color-primary)] p-4 rounded-lg shadow-sm"
                  >
                    <p className="italic text-[var(--color-light-100)]">
                      "{review.content.substring(0, 180)}..."
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      — {review.author}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--color-light-200)]">
                No reviews available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
