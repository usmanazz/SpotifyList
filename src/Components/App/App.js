import React from "react";
import "./App.css";

import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Playlist from "../Playlist/Playlist";

import Spotify from "../../util/Spotify";

class App extends React.Component {
  constructor(props) {
    super(props);
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

  componentDidMount() {
    window.addEventListener("load", () => {
      Spotify.getAccessToken();
    });
  }

  addTrack(track) {
    let tracks = this.state.playlistTracks;
    if (tracks.find((element) => track.id === element.id)) {
      return;
    }

    tracks.push(track);
    this.setState({ playlistTracks: tracks });
  }

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

  addAndRemoveTrack(track, isRemoval) {
    this.addTrack(track);
    this.removeTrack(track, isRemoval);
  }

  updatePlaylistName(name) {
    this.setState({ playlistName: name });
  }

  savePlaylist() {
    const trackURIs = this.state.playlistTracks.map((track) => track.uri);

    Spotify.savePlaylist(this.state.playlistName, trackURIs).then(() => {
      this.setState({
        playlistName: "New Playlist",
        playlistTracks: [],
      });
    });
  }

  search(searchTerm, playlistTracks) {
    Spotify.search(searchTerm, playlistTracks).then((searchResults) => {
      this.setState({ searchResults: searchResults });
    });
  }

  render() {
    return (
      <div>
        <h1>
          Ja<span className="highlight">mmm</span>ing
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
