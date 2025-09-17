import { Client, Databases, ID, Query } from "appwrite";


const PROJECT_ID= import.meta.env.VITE_APPWRITE_PROJECT_ID
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // 1. Check if the search term already exists
    const result = await database.listDocuments(DATABASE_ID, 'metrics', [
      Query.equal('searchTerm', searchTerm),
    ]);

    if (result.documents.length > 0) {
      // 2. If it exists, update the count
      const documentId = result.documents[0].$id;
      const currentCount = result.documents[0].count;
      await database.updateDocument(DATABASE_ID, 'metrics', documentId, {
        count: currentCount + 1,
      });
    } else {
      // 3. If it doesn't exist, create a new document
      await database.createDocument(
        DATABASE_ID,
        'metrics',
        ID.unique(),
        {
          searchTerm,
          count: 1,
          movie_id: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }
      );
    }
  } catch (err) {
    console.error('Error updating search count:', err);
  }
};

export const getTrendingMovies = async() =>{
    try{
        const result = await database.listDocuments(DATABASE_ID, 'metrics', [
            Query.orderDesc('count'),
            Query.limit(5)
        ])
        return result.documents
    }catch(err){
        console.error('Error fetching trending movies:', err);
    }
}