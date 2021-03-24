import React from "react";

import "./TrackList.css";

import Track from "../Track/Track";

class TrackList extends React.Component {
  mapTracks() {
    if (this.props.tracks) {
      return this.props.tracks.map((track) => (
        <Track
          track={track}
          key={track.id}
          onAdd={this.props.onAdd}
          onRemove={this.props.onRemove}
          onAddAndRemove={this.props.onAddAndRemove}
          isRemoval={this.props.isRemoval}
        />
      ));
    }
  }

  render() {
    return <div className="TrackList">{this.mapTracks()}</div>;
  }
}

export default TrackList;
