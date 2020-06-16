import {Component, NgZone, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  mode: 'none' | 'player-selection' | 'chart' = 'none';

  // Data for player selection mode
  players: { name: string, colour: string }[] = [];
  // Example (for testing): [{name: 'Ollie', colour: '#4363d8'}, {name: 'Mia', colour: '#e6194b'}, {name: 'Noah', colour: '#3cb44b'}];
  rows: { name: string, colour: string }[][] = [];

  // Data for chart
  chartData = null; // Example (for testing): [
  //   {
  //     name: 'Ollie',
  //     series: [
  //       {value: 0, name: 0},
  //       {value: 1, name: 1},
  //       {value: 2, name: 2},
  //       {value: 3, name: 3},
  //       {value: 3, name: 4}
  //     ]
  //   },
  //   {
  //     name: 'Mia',
  //     series: [
  //       {value: 0, name: 0},
  //       {value: 0, name: 1},
  //       {value: 0, name: 2},
  //       {value: -1, name: 3},
  //       {value: -2, name: 4}
  //     ]
  //   },
  //   {
  //     name: 'Noah',
  //     series: [
  //       {value: 0, name: 0},
  //       {value: -1, name: 1},
  //       {value: -2, name: 2},
  //       {value: -2, name: 3},
  //       {value: -1, name: 4}
  //     ]
  //   }
  // ];
  colourScheme = null; // Example (for testing): {domain: ['#4363d8', '#e6194b', '#3cb44b']};
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Round';
  showYAxisLabel = true;
  yAxisLabel = 'Score';
  showGridLines = false;
  xScaleMin = 0;

  constructor(private ngZone: NgZone) {
  }

  ngOnInit() {
    this.updateRows();
    const context = cast.framework.CastReceiverContext.getInstance();

    function padAndChop(str, padChar, length) {
      return (Array(length).fill(padChar).join('') + str).slice(length * -1);
    }

    function decimalToAARRGGBBHexTwosComplement(value) {
      let binaryStr;
      const bitCount = 8 * 4;

      if (value >= 0) {
        const twosComp = value.toString(2);
        binaryStr = padAndChop(twosComp, '0', (bitCount || twosComp.length));
      } else {
        binaryStr = (Math.pow(2, bitCount) + value).toString(2);

        if (Number(binaryStr) < 0) {
          return undefined;
        }
      }

      return '#' + parseInt(binaryStr, 2).toString(16).slice(2);
    }

    const PLAYER_LIST_CHANNEL = 'urn:x-cast:nz.co.olliechick.scumgraph.playerlist';
    context.addCustomMessageListener(PLAYER_LIST_CHANNEL, customEvent => {
      this.ngZone.run(() => this.mode = 'player-selection');
      const players = customEvent.data.players;
      players.forEach(item => item.colour = decimalToAARRGGBBHexTwosComplement(item.colour));
      this.ngZone.run(() => this.players = players);
      this.updateRows();
    });

    const CHART_CHANNEL = 'urn:x-cast:nz.co.olliechick.scumgraph.chart';
    context.addCustomMessageListener(CHART_CHANNEL, customEvent => {
      this.ngZone.run(() => {
        this.mode = 'chart';
        this.chartData = customEvent.data.playerHistories;
        this.colourScheme = {domain: customEvent.data.colours.map(decimalToAARRGGBBHexTwosComplement)};
      });
    });

    context.start();
  }

  formatAxisTick(value) {
    return Number.isInteger(value) ? value : '';
  }

  updateRows() {
    const emptyRow = [
      {name: '', colour: '#2a2a2a'},
      {name: '', colour: '#2a2a2a'},
      {name: '', colour: '#2a2a2a'},
      {name: '', colour: '#2a2a2a'}
    ];

    const rows: { name: string, colour: string }[][] = [[...emptyRow]];
    for (let i = 0; i < 4; i++) {
      rows.push([...emptyRow]);
    }

    this.players.forEach((player, i) => {
      rows[Math.floor(i / 4)][i % 4] = player;
    });

    this.ngZone.run(() => this.rows = rows);
  }

  getTextColour(colour: string) {
    const red = parseInt(colour.slice(1, 3), 16);
    const green = parseInt(colour.slice(3, 5), 16);
    const blue = parseInt(colour.slice(5, 7), 16);

    // https://en.wikipedia.org/wiki/YIQ
    // https://24ways.org/2010/calculating-color-contrast/
    const yiq = (red * 299 + green * 587 + blue * 114) / 1000;
    return yiq < 192 ? 'white' : 'black';
  }
}
