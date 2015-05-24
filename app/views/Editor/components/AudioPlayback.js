import React from 'react/addons';

class AudioPlayback extends React.Component {
  componentWillMount() {
    this.volumeNode = this.props.ctx.createGain();
    this.volumeNode.connect(this.props.ctx.destination);
    this.volumeNode.gain.value = 0.5;
  }

  play() {
    const src = this.props.ctx.createBufferSource();
    src.connect(this.volumeNode);
    src.buffer = this.props.audioData;

    // playbackOffset is in 1/24th beats, convert to # of beats
    const beatOffset = this.props.playbackOffset / 24;

    // convert # of beats offset to seconds
    const secPerBeat = 60 / this.props.bpm;
    const offsetSec = secPerBeat * beatOffset;

    src.start(0, offsetSec);

    this.src = src;
  }

  stop() {
    this.src.stop();
  }

  componentWillReceiveProps(nextProps) {
    const curProps = this.props;

    if (nextProps.playing !== curProps.playing) {
      if (!nextProps.playing) {
        this.stop();
      } else {
        this.play();
      }
    }
  }

  render() {
    return <span />;
  }
}

AudioPlayback.propTypes = {
  // Whether the audio is playing or stopped
  playing: React.PropTypes.bool.isRequired,

  // The offset, in 1/24th beats, to start playing at
  playbackOffset: React.PropTypes.number.isRequired,

  // bpm of current audio track
  bpm: React.PropTypes.number.isRequired,

  // TODO: make these objects more specific
  ctx: React.PropTypes.object.isRequired,
  audioData: React.PropTypes.object.isRequired
};

export default AudioPlayback;
