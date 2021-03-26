import React from "react";
import "./App.css";

import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Playlist from "../Playlist/Playlist";

import Spotify from "../../util/Spotify";

class App extends React.Component {
  constructor(props) {
    super(props);

    // Keep track state of playlist  name, playlist tracks, and search result
    // tracks fetched when search for album artist or song name.
    this.state = {
      searchResults: [],
      playlistName: "My Playlist",
      playlistTracks: [],
    };

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
    this.addAndRemoveTrack = this.addAndRemoveTrack.bind(this);
  }

  // Check if current link contains access token, search spotify with term saved in
  // session storage and store returned tracks from fetch call in state.
  componentDidMount() {
    if (window.location.href.match(/access_token=/)) {
      Spotify.search(window.sessionStorage.searchTerm).then((searchResults) => {
        this.setState({ searchResults: searchResults });
      });
    }
  }

  // Add track to playlist section.
  // Note: DO NOT MODIFY STATE, create new list of tracks
  addTrack(track) {
    let tracks = this.state.playlistTracks;
    if (tracks.find((element) => track.id === element.id)) {
      return;
    }

    tracks.push(track);
    this.setState({ playlistTracks: tracks });
  }

  // Remove tracks from playlist section if isRemoval is true and
  // remove tracks from searchResults section if isRemoval is false.
  removeTrack(track, isRemoval) {
    let tracks = isRemoval
      ? this.state.playlistTracks
      : this.state.searchResults;
    tracks = tracks.filter((tr) => tr.id !== track.id);
    let updatedTracks = isRemoval
      ? { playlistTracks: tracks }
      : { searchResults: tracks };
    this.setState(updatedTracks);
  }

  // Uses addTrack and removeTrack to simultaneously add a track to
  // playlist section and remove it from searchResults.
  addAndRemoveTrack(track, isRemoval) {
    this.addTrack(track);
    this.removeTrack(track, isRemoval);
  }

  // Changes playlist name based on user input
  updatePlaylistName(name) {
    this.setState({ playlistName: name });
  }

  // Adds new playlist with tracks to user's spotify playlist.
  savePlaylist() {
    const trackURIs = this.state.playlistTracks.map((track) => track.uri);

    Spotify.savePlaylist(this.state.playlistName, trackURIs).then(() => {
      this.setState({
        playlistName: "New Playlist",
        playlistTracks: [],
      });
    });
  }

  // Saves user input term in search bar to sessionStorage for later use
  // and searches for searchTerm via fetch call to Spotify API.
  search(searchTerm, playlistTracks) {
    if (!searchTerm) {
      return;
    }
    window.sessionStorage.searchTerm = searchTerm;

    Spotify.search(searchTerm, playlistTracks).then((searchResults) => {
      this.setState({ searchResults: searchResults });
    });
  }

  // Overall layout of Web app that calls SearchBar, SearchResults, and Playlist
  // React Components and passes down methods as props.
  render() {
    return (
      <div>
        <h1>
          Spotify<span className="highlight">List</span>
        </h1>
        <div className="App">
          <SearchBar
            onSearch={this.search}
            playlistTracks={this.state.playlistTracks}
          />
          <div className="App-playlist">
            <SearchResults
              searchResults={this.state.searchResults}
              onAdd={this.addTrack}
              onAddAndRemove={this.addAndRemoveTrack}
            />
            <Playlist
              playlistTracks={this.state.playlistTracks}
              playlistName={this.state.playlistName}
              onRemove={this.removeTrack}
              onNameChange={this.updatePlaylistName}
              onSave={this.savePlaylist}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
