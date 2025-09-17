import { useEffect, useState , useRef, use} from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import {useDebounce} from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite'


const API_KEY = import.meta.env.VITE_TMBD_API_KEY
const API_BASE_URL = import.meta.env.VITE_TMBD_BASE_URL

const API_METHODS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}
function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [movieList, setMovieList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [trendingMovies, setTrendingMovies] = useState([])
  const [isLoadingTrending, setIsLoadingTrending] = useState(false)
  const [trendingError, setTrendingError] = useState('')

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

 useDebounce(
  () => {
    setDebouncedSearchTerm(searchTerm)
  },
  1000,
  [searchTerm]
 )

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    try{
      const endpoint = 
        query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
      
      const response = await fetch(endpoint, API_METHODS);
      if(!response.ok){
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setErrorMessage('');

      if(data.Response === "False"){
        setErrorMessage(data.Error || 'Error fetching movies');
        setMovieList([]);
        return
      }
      setMovieList(data.results || []);

      if(query && data.results.length > 0){
        await updateSearchCount(data.results[0].title, data.results[0]);
      }

    }catch(err){
      console.error(err);
      setErrorMessage('Failed to fetch movies. Please try again later.');
     
    }finally{
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async() =>{
    setIsLoadingTrending(true);
    try{
      const movies = await getTrendingMovies();
      setTrendingMovies(movies || []);
    }catch(err){
      console.error('Error loading trending movies:', err);
      setTrendingError('Failed to load trending movies. Please try again later.');
    }finally{
      setIsLoadingTrending(false);
    }
  }
  useEffect(() => {
   fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm])

  useEffect(() => {
    loadTrendingMovies();
  },[])

  return (
    <main>
      <div className='pattern'/>
      <div className='wrapper'>
        <header>
          <img src='./hero.png' alt="Hero Banner" />
        <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
       <Search searchTerm = {searchTerm} setSearchTerm = {setSearchTerm}/>
        </header>
        {
          trendingMovies.length >0 && 
          <section className='trending'>
            <h2>Trending Movies</h2>
             {
                isLoadingTrending ? <Spinner /> : trendingError ? <p className='text-red-500'>{trendingError}</p> : <ul>
                {trendingMovies.map((trendingMovie,index)=>(
                  <li key={trendingMovie.$id}>
                    <p>{index + 1}</p>
                    <img src={trendingMovie.poster_url} alt={trendingMovie.searchTerm} />
                  </li>
                ))}
              </ul>

                }
          </section>
        }
        <section className='all-movies'>
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : <ul>
            {movieList.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </ul>
          }
        </section>
      </div>

    </main>
  )
}

export default App
