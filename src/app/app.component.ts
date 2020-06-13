import {Component, NgZone, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  players: { name: string, colour: string }[] = [];
  rows: { name: string, colour: string }[][] = [];
  mode: 'none' | 'player-selection' | 'chart' = 'none';

  // options for the chart
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Round';
  showYAxisLabel = true;
  yAxisLabel = 'Score';

  colorScheme = {
    domain: ['#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB']
  };

  // pie
  showLabels = true;

  // data goes here
  public single = [
    {
      name: 'Player 1',
      series: [
        {
          value: 0,
          name: 0
        },
        {
          value: 1,
          name: 1
        },
        {
          value: 2,
          name: 2
        },
        {
          value: 3,
          name: 3
        }
      ]
    },
    {
      name: 'Player 2',
      series: [
        {
          value: 0,
          name: 0
        },
        {
          value: 0,
          name: 1
        },
        {
          value: 0,
          name: 2
        },
        {
          value: -1,
          name: 3
        }
      ]
    },
    {
      name: 'Player 3',
      series: [
        {
          value: 0,
          name: 0
        },
        {
          value: -1,
          name: 1
        },
        {
          value: -2,
          name: 2
        },
        {
          value: -2,
          name: 3
        }
      ]
    }
  ];

  formatYAxisTick(value) {
    console.log(value);
    if (Number.isInteger(value)) {
      return value;
    } else {
      return '';
    }
  }

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
      this.ngZone.run(() => this.mode = 'chart');
    });

    context.start();
  }

  addPlayer() { // for debugging purposes only
    // this.players.push({name: 'New player', colour: '#ffbfa9'});
    const players = [
      {name: 'test', colour: '#f298ff'},
      {name: '', colour: '#2a2a2a'},
      {name: '', colour: '#2a2a2a'},
      {name: '', colour: '#2a2a2a'}
    ];
    this.ngZone.run(() => this.players = players);

    this.updateRows();
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
