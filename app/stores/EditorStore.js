import ImmutableStore from './ImmutableStore';
import { Record, List } from 'immutable';

const Note = Record({
  // Beat the note starts at (add offset)
  beat: 0,

  // Offset, in "24ths", from the start of the beat
  // e.g.: 0 is a 4th
  //       12 is an 8th
  //       8 and 16 are triplets ("12ths")
  //       6 and 18 are 16ths
  //       3 is a 32nd...
  offset: 0,

  // Column, between 0 and 6, for the note to be placed in
  col: 0
});

const StateRecord = Record({
  notes: null,
  bpm: null,

  inPlayback: false,
  playbackOffset: 0
});

class EditorStore extends ImmutableStore {
  constructor(flux) {
    super({StateRecord});

    this.state = new StateRecord({
      notes: new List([]),
      bpm: 120
    });

    const actionIds = flux.getActionIds('editor');

    this.register(actionIds.toggleNote, this.handleToggleNote);

    this.register(actionIds.enterPlayback, this.handleEnterPlayback);
    this.register(actionIds.exitPlayback, this.handleExitPlayback);

    this.register(actionIds.changeBPM, this.handleChangeBPM);
    this.register(actionIds.loadData, this.handleLoadData);
  }


  /*
   * Data accessors
   */
  getNumMeasures(length) {
    const numBeats = Math.ceil(this.state.bpm / (60 / length));
    return Math.ceil(numBeats / 4);
  }


  /*
   * Adding & removing notes
   */
  handleToggleNote({offset, column}) {
    const beat = Math.floor(offset / 24);
    const offsetInBeat = offset % 24;

    const entry = this.state.notes.findEntry((note) => {
      return note.beat === beat && note.offset === offsetInBeat && note.col === column;
    });

    if (!entry) {
      const note = new Note({
        beat: beat,
        offset: offsetInBeat,
        col: column
      });

      this.setState({
        notes: this.state.notes.push(note)
      });

    } else {
      const idx = entry[0];
      this.setState({
        notes: this.state.notes.remove(idx)
      });
    }

  }

  handleChangeBPM(bpm) {
    this.setState({bpm});
  }

  /*
   * Playback things
   */

  handleEnterPlayback({offset}) {
    this._createPlaybackRunLoop();

    this.setState({
      inPlayback: true,
      playbackOffset: offset
    });
  }

  handleExitPlayback() {
    this._stopPlaybackRunLoop();

    this.setState({
      inPlayback: false
    });
  }

  _createPlaybackRunLoop() {
    let prev = Date.now();

    let runLoop = () => {
      const now = Date.now();
      const dt = now - prev;
      prev = now;

      this._updatePlaybackOffset(dt);

      window.requestAnimationFrame(runLoop);
    };

    this._stopPlaybackRunLoop = () => {
      runLoop = () => {};
    };

    window.requestAnimationFrame(runLoop);
  }

  _updatePlaybackOffset(dt) {
    const prevOffset = this.state.playbackOffset;

    const bpm = this.state.bpm;
    const secPerBeat = 60 / bpm;
    const secPerThirtySecond = secPerBeat / 24;
    const elapsedOffset = (dt / (secPerThirtySecond * 1000));

    this.setState({
      playbackOffset: prevOffset + elapsedOffset
    });
  }


  /*
   * Serialization
   */

  serializeData() {
    const notes = this.state.notes;
    const bpm = this.state.bpm;

    return JSON.stringify({notes, bpm});
  }

  handleLoadData(data) {
    data = JSON.parse(data);

    const noteRecords = data.notes.map((noteProps) => new Note(noteProps));
    const notes = new List(noteRecords);

    this.setState({
      notes,
      bpm: data.bpm
    });
  }
}

export default EditorStore;
