import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table } from 'react-bootstrap';
import { FaHeart, FaMugHot, FaMusic, FaPause, FaPauseCircle, FaPlay, FaPlayCircle } from 'react-icons/fa';

function Favorities() {
  const [playlist, setPlaylist] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  useEffect(() => {

      axios
        .get(`http://localhost:3000/favorities`)
        .then((response) => {
          const playlistData = response.data;
          setPlaylist(playlistData);
        })
        .catch((error) => {
          console.error('Error fetching playlist items: ', error);
        });
    

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
    playlist.forEach((item) => {
      const audioElement = document.getElementById(`audio-${item.id}`);
      if (audioElement) {
        handlePlay(item.id, audioElement);
      }
    });

    // Cleanup event listeners
    return () => {
      playlist.forEach((item) => {
        const audioElement = document.getElementById(`audio-${item.id}`);
        if (audioElement && eventListeners[item.id]) {
          audioElement.removeEventListener('play', eventListeners[item.id]);
        }
      });
    };
  }, [playlist, currentlyPlaying]);

 

  const removeFromFavorites = async (itemId) => {
    try {
      // Find the item in the wishlist by itemId
      // Convert both values to strings to ensure consistent comparison
      const selectedItem = playlist.find((item) => String(item.itemId) === String(itemId));
      if (!selectedItem) {
        throw new Error('Selected item not found in wishlist');
      }
      // Make a DELETE request to remove the item from the wishlist
      await axios.delete(`http://localhost:3000/favorities/${selectedItem.id}`);
      // Refresh the wishlist items
      const response = await axios.get('http://localhost:3000/favorities');
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error removing item from wishlist: ', error);
    }
  };
  

  
  
  return (
    <div >
      <div style={{marginLeft:"240px"}}>
     <div className="container mx-auto p-8">
        <h2 className="text-3xl font-semibold mb-4 text-center">Favorites</h2>
       
        <Table  responsive style={{width:"1150px"}} >

            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Genre</th>
                <th></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {playlist.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex' }}>
                      <img
                        src={String(item.itemId) === "6" ? "/songs/tum_hi_ho.jpg" : item.imgUrl}
                        alt={item.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/200?text=Image+Not+Available";
                        }}
                        className="rounded"
                        style={{ height: '50px', width: '50px' }}
                      />
                      <div style={{ paddingLeft: '20px' }}>
                        <strong> {item.title}</strong>
                        <p><td>{item.singer}</td></p>
                      </div>
                    </div>
                  </td>
                  <td>{item.genre}</td>
                  <td>
                    <Button
                      style={{ backgroundColor: 'white', border: 'none' }}
                      onClick={() => removeFromFavorites(item.itemId)}
                    >
                      <FaHeart color="red" />
                    </Button>
                  </td>
                  <td>
                  <audio controls id={`audio-${item.id}`} style={{ width: '250px' }}>
                  <source src={item.songUrl} />
                </audio>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
      </div>
     </div>
    
    </div>
  );
}

export default Favorities;
