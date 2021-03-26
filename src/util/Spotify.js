const clientID = "81e6669548764546854f46c58b103a95";
const redirectUri = "https://spotifylist.netlify.app/";

// "https://myspotifyextension.surge.sh"

let accessToken;
let Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    // check for access token match in url
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expireTime = Number(expiresInMatch[1]);
      // This clears the parameters, allows us to grab new
      // access token when it expires.
      window.setTimeout(() => (accessToken = ""), expireTime * 1000);
      window.history.pushState("Access Token", null, "/");
      return accessToken;
    } else {
      // access token is empty and not found in URL
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = accessUrl;
    }
  },

  // accepts a search term input, passes the search term value to a Spotify request,
  // then returns the response as a list of tracks in JSON format.
  search(term, playlistTracks) {
    const accessToken = Spotify.getAccessToken();

    // start promise chain by returning GET request with user input 'term'
    return (
      fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        // return response as JSON
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Request Failed!");
        })
        // map JSON to an array of tracks
        .then((jsonResponse) => {
          if (!jsonResponse.tracks) {
            return [];
          }

          // Simplify json response to match App.js tracks format in App.js state.
          const jsonResponseSimplify = jsonResponse.tracks.items.map(
            (track) => ({
              id: track.id,
              name: track.name,
              artist: track.artists[0].name,
              album: track.album.name,
              uri: track.uri,
            })
          );

          // stringify each object in the array to compare with playlistTracks
          const jsonResponseItemsToString = jsonResponseSimplify.map((track) =>
            JSON.stringify(track)
          );

          // If playlist tracks section contains no tracks, return empty array.
          // Otherwise, stringlify each object in playlist array.
          let playlistTracksToString;
          if (!playlistTracks) {
            playlistTracksToString = [];
          } else {
            playlistTracksToString = playlistTracks.map((track) =>
              JSON.stringify(track)
            );
          }

          // filter out songs from searchResults that are already in playlist section
          let songsNotInPlaylist = jsonResponseItemsToString.filter(
            (e) => !playlistTracksToString.includes(e)
          );

          songsNotInPlaylist = songsNotInPlaylist.map((track) =>
            JSON.parse(track)
          );

          return songsNotInPlaylist.map((track) => ({
            id: track.id,
            name: track.name,
            artist: track.artist,
            album: track.album,
            uri: track.uri,
          }));
        })
    );
  },

  // Writes the user's custom playlist in SpotifyList to their Spotify account.
  // Method accepts the playlist name and array of track URIs.
  savePlaylist(name, arrOfUri) {
    // If no name provided or array of track URIs is empty, dont save playlist.
    if (!name || !arrOfUri.length) {
      return;
    }

    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userId;

    // Request that returns user's Spotify username
    return fetch("https://api.spotify.com/v1/me", { headers: headers })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Request failed!");
      })
      .then((jsonResponse) => {
        userId = jsonResponse.id;
        // POST reuqest that creates new playlist in the user's Spotify account
        // and returns playlist ID.
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
          headers: headers,
          method: "POST",
          body: JSON.stringify({ name: name }),
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error("Request failed!");
          })
          .then((jsonResponse) => {
            const playlistId = jsonResponse.id;
            // POST request that uses user and playlist ID to create playlist in user's account.
            // Use the Spotify playlist endpoints to find a request that adds tracks to a playlist.
            // Sets the URIs parameter to an array of track URIs passed into the method.
            return fetch(
              `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
              {
                headers: headers,
                method: "POST",
                body: JSON.stringify({ uris: arrOfUri }),
              }
            );
          });
      });
  },
};

export default Spotify;
