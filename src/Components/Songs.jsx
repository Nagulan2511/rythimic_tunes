import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import './sidebar.css'

function Songs() {
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [playlist, setPlaylist] = useState([]);  
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch all items immediately when component mounts
    const fetchData = async () => {
      try {
        // Fetch all items
        const itemsResponse = await axios.get('http://localhost:3000/items');
        setItems(itemsResponse.data);
        
        // Fetch favorites items
        const favoritesResponse = await axios.get('http://localhost:3000/favorities');
        setWishlist(favoritesResponse.data);
        
        // Fetch playlist items
        const playlistResponse = await axios.get('http://localhost:3000/playlist');
        setPlaylist(playlistResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    // Call the fetch function immediately
    fetchData();
    
    // Function to handle audio play
    const handleAudioPlay = (itemId, audioElement) => {
      if (currentlyPlaying && currentlyPlaying !== audioElement) {
        currentlyPlaying.pause(); // Pause the currently playing audio
      }
      setCurrentlyPlaying(audioElement); // Update the currently playing audio
    };
  
    // Create an object to store event listener references
    const eventListeners = {};
  
    // Event listener to handle audio play
    const handlePlay = (itemId, audioElement) => {
      // Create a function reference we can use for both adding and removing
      const playHandler = () => handleAudioPlay(itemId, audioElement);
      
      // Store the reference in our object
      eventListeners[itemId] = playHandler;
      
      audioElement.addEventListener('play', playHandler);
    };
  
    // Add event listeners for each audio element
    items.forEach((item) => {
      const audioElement = document.getElementById(`audio-${item.id}`);
      if (audioElement) {
        handlePlay(item.id, audioElement);
      }
    });
  
    // Cleanup event listeners
    return () => {
      items.forEach((item) => {
        const audioElement = document.getElementById(`audio-${item.id}`);
        if (audioElement && eventListeners[item.id]) {
          audioElement.removeEventListener('play', eventListeners[item.id]);
        }
      });
    };
  }, [items, currentlyPlaying]);
  

  const addToWishlist = async (itemId) => {
    try {
      const selectedItem = items.find((item) => item.id === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found');
      }
      const { title, imgUrl, genre, songUrl, singer, id: itemId2 } = selectedItem;
      await axios.post('http://localhost:3000/favorities', { itemId: itemId2, title, imgUrl, genre, songUrl, singer });
      const response = await axios.get('http://localhost:3000/favorities');
      setWishlist(response.data);
    } catch (error) {
      console.error('Error adding item to wishlist: ', error);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      // Find the item in the wishlist by itemId
      const selectedItem = wishlist.find((item) => item.itemId === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found in wishlist');
      }
      // Make a DELETE request to remove the item from the wishlist
      await axios.delete(`http://localhost:3000/favorities/${selectedItem.id}`);
      // Refresh the wishlist items
      const response = await axios.get('http://localhost:3000/favorities');
      setWishlist(response.data);
    } catch (error) {
      console.error('Error removing item from wishlist: ', error);
    }
  };
  
  const isItemInWishlist = (itemId) => {
    return wishlist.some((item) => item.itemId === itemId);
  };

  
  const addToPlaylist = async (itemId) => {
    try {
      const selectedItem = items.find((item) => item.id === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found');
      }
      const { title, imgUrl, genre, songUrl, singer, id: itemId2 } = selectedItem;
      await axios.post('http://localhost:3000/playlist', { itemId: itemId2, title, imgUrl, genre, songUrl, singer });
      const response = await axios.get('http://localhost:3000/playlist');
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error adding item to wishlist: ', error);
    }
  };

  const removeFromPlaylist = async (itemId) => {
    try {
      // Find the item in the wishlist by itemId
      const selectedItem = playlist.find((item) => item.itemId === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found in wishlist');
      }
      // Make a DELETE request to remove the item from the wishlist
      await axios.delete(`http://localhost:3000/playlist/${selectedItem.id}`);
      // Refresh the wishlist items
      const response = await axios.get('http://localhost:3000/playlist');
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error removing item from wishlist: ', error);
    }
  };
  
  const isItemInPlaylist = (itemId) => {
    return playlist.some((item) => item.itemId === itemId);
  };


  const filteredItems = items.filter((item) => {
    const lowerCaseQuery = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(lowerCaseQuery) ||
      item.singer.toLowerCase().includes(lowerCaseQuery) ||
      item.genre.toLowerCase().includes(lowerCaseQuery)
    );
  });


    return (
      <div className="songs-page">
        <div className="songs-container">
          <h2 className="songs-title">Songs List</h2>
          
          <InputGroup className="mb-3">
            <InputGroup.Text id="search-icon">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search by singer, genre, or song name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <br />
          
          <div className="song-cards">
            {filteredItems.map((item, index) => (
              <div key={item.id} className="song-card">
                <div className="song-image">
                  <img
                    src={item.id === "6" ? "/songs/tum_hi_ho.jpg" : item.imgUrl}
                    alt={item.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/200?text=Image+Not+Available";
                    }}
                  />
                </div>
                
                <div className="song-info">
                  <div className="song-header">
                    <h3>{item.title}</h3>
                    {isItemInWishlist(item.id) ? (
                      <Button
                        variant="link"
                        className="favorite-btn"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        <FaHeart className="favorite-icon active" />
                      </Button>
                    ) : (
                      <Button
                        variant="link"
                        className="favorite-btn"
                        onClick={() => addToWishlist(item.id)}
                      >
                        <FaRegHeart className="favorite-icon" />
                      </Button>
                    )}
                  </div>
                  
                  <p className="genre-text">Genre: {item.genre}</p>
                  <p className="singer-text">Singer: {item.singer}</p>
                  
                  <audio controls className="audio-player" id={`audio-${item.id}`}>
                    <source src={item.songUrl} />
                    Your browser does not support the audio element.
                  </audio>
                  
                  <div className="playlist-action">
                    <Button
                      variant="outline-primary"
                      className="playlist-btn"
                      onClick={() => isItemInPlaylist(item.id) ? removeFromPlaylist(item.id) : addToPlaylist(item.id)}
                    >
                      {isItemInPlaylist(item.id) ? 'Remove from Playlist' : 'Add to Playlist'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

export default Songs;
