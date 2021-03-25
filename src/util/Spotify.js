const clientID = "81e6669548764546854f46c58b103a95";
const redirectUri = "http://localhost:3000";

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

  search(term, playlistTracks) {
    const accessToken = Spotify.getAccessToken();

    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Request Failed!");
      })
      .then((jsonResponse) => {
        if (!jsonResponse.tracks) {
          return [];
        }

        const jsonResponseSimplify = jsonResponse.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri,
        }));

        const jsonResponseItemsToString = jsonResponseSimplify.map((track) =>
          JSON.stringify(track)
        );

        let playlistTracksToString;
        if (!playlistTracks) {
          playlistTracksToString = [];
        } else {
          playlistTracksToString = playlistTracks.map((track) =>
            JSON.stringify(track)
          );
        }

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
      });
  },

  savePlaylist(name, arrOfUri) {
    if (!name || !arrOfUri.length) {
      return;
    }

    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userId;

    return fetch("https://api.spotify.com/v1/me", { headers: headers })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Request failed!");
      })
      .then((jsonResponse) => {
        userId = jsonResponse.id;
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
