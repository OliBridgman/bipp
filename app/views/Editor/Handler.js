import React from 'react';
import FluxComponent from 'flummox/component';
import { Range } from 'immutable';

const VIEWPORT_HEIGHT = 600;
const WIDTH = 450;
const BEAT_SPACING = 80;
const LANE_WIDTH = 60;
const NOTE_HEIGHT = 20;
const THIRTY_SECOND_HEIGHT = BEAT_SPACING/8;

class Editor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      offset: 0
    };
  }

  handleToggleNote(column) {
    this.props.flux.getActions('editor').toggleNote(this.state.offset, column);
  }

  handleKeyPress(e) {
    const UP_ARROW = 38;
    const DOWN_ARROW = 40;
    const ESC_KEY = 27;
    const P_KEY = 80;

    const toggleNoteMap = {
      83: 0,  // s
      68: 1,  // d
      70: 2,  // f
      32: 3,  // space
      74: 4,  // j
      75: 5,  // k
      76: 6   // l
    };

    if (this.props.inPlayback) {
      if (e.keyCode === ESC_KEY || e.keyCode === P_KEY) {
        this.props.flux.getActions('editor').exitPlayback();
      }

    } else {
      if (e.keyCode === UP_ARROW) {
        // TODO: Check for max offset

        this.setState((state) => ({
          offset: state.offset + 4
        }));

      } else if (e.keyCode === DOWN_ARROW) {
        if (this.state.offset > 0) {
          this.setState((state) => ({
            offset: state.offset - 4
          }));
        }

      } else if (e.keyCode === P_KEY) {
        this.props.flux.getActions('editor').enterPlayback(this.state.offset);

      } else if (toggleNoteMap[e.keyCode] !== undefined) {
        this.handleToggleNote(toggleNoteMap[e.keyCode]);

      } else {
        console.log(e.keyCode);
      }
    }
  }

  renderCenterBar() {
    return (
      <rect x="0" y={VIEWPORT_HEIGHT / 2 - NOTE_HEIGHT / 2} width={WIDTH} height={NOTE_HEIGHT} 
        fill="#4A90E2" />
    );
  }

  renderMeasures() {
    const numMeasures = this.props.numMeasures;

    const range = Range(0, numMeasures);

    return range.map((num) => {
      return (
        <svg key={`measure-${num}`} y={num * BEAT_SPACING * 4} style={{overflow:"visible"}}>
          <line x1="0" x2={WIDTH}
            y1={BEAT_SPACING * 0} y2={BEAT_SPACING * 0} stroke="black" />
          <line x1="0" x2={WIDTH}
            y1={BEAT_SPACING * 1} y2={BEAT_SPACING * 1} stroke="grey" />
          <line x1="0" x2={WIDTH}
            y1={BEAT_SPACING * 2} y2={BEAT_SPACING * 2} stroke="grey" />
          <line x1="0" x2={WIDTH}
            y1={BEAT_SPACING * 3} y2={BEAT_SPACING * 3} stroke="grey" />
        </svg>
      );
    });
  }

  renderNotes() {
    const notes = this.props.notes;

    return notes.map((note) => {
      const measureOffset = note.measure * BEAT_SPACING * 4;
      const beatOffset = BEAT_SPACING / 8 * note.offset;
      const y = measureOffset + beatOffset - NOTE_HEIGHT / 2;

      const key = `note-${note.measure}-${note.offset}-${note.col}`;

      return (
        <rect key={key}
          x={note.col * LANE_WIDTH}
          y={y}
          width={LANE_WIDTH}
          height={NOTE_HEIGHT} />
      );
    });
  }

  getOffset() {
    if (this.props.inPlayback) {
      return this.props.playbackOffset * THIRTY_SECOND_HEIGHT;
    } else {
      return this.state.offset * THIRTY_SECOND_HEIGHT;
    }
  }

  render() {
    const height = this.props.numMeasures * BEAT_SPACING * 4;
    const offset = this.getOffset();

    const scrollY = -1 * (height - offset - (VIEWPORT_HEIGHT / 2));

    return (
      <div onKeyDown={(e) => this.handleKeyPress(e)} tabIndex="1">
        <svg width={WIDTH} height={VIEWPORT_HEIGHT}>
          {this.renderCenterBar()}
          <g transform={`translate(0, ${scrollY})`}>
            <g transform={`translate(0, ${height}) scale(1, -1)`}>
              {this.renderMeasures()}
              {this.renderNotes()}
            </g>
          </g>
        </svg>
      </div>
    );
  }
}

class EditorOuter extends React.Component {
  render() {
    return (
      <FluxComponent flux={this.props.flux} connectToStores={{
        editor: (store) => ({
          notes: store.state.notes,
          numMeasures: store.getNumMeasures(),

          inPlayback: store.state.inPlayback,
          playbackOffset: store.state.playbackOffset
        })
      }}>
        <Editor />
      </FluxComponent>
    );
  }
}

export default EditorOuter;
