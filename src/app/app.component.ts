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

  view: any[] = [600, 400];

  // options for the chart
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Country';
  showYAxisLabel = true;
  yAxisLabel = 'Sales';
  timeline = true;

  colorScheme = {
    domain: ['#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB']
  };

  // pie
  showLabels = true;

  // data goes here
  public single = [
    {
      name: 'China',
      value: 2243772
    },
    {
      name: 'USA',
      value: 1126000
    },
    {
      name: 'Norway',
      value: 296215
    },
    {
      name: 'Japan',
      value: 257363
    },
    {
      name: 'Germany',
      value: 196750
    },
    {
      name: 'France',
      value: 204617
    }
  ];

  public multi = [
    {
      name: 'China',
      series: [
        {
          name: '2018',
          value: 2243772
        },
        {
          name: '2017',
          value: 1227770
        }
      ]
    },

    {
      name: 'USA',
      series: [
        {
          name: '2018',
          value: 1126000
        },
        {
          name: '2017',
          value: 764666
        }
      ]
    },

    {
      name: 'Norway',
      series: [
        {
          name: '2018',
          value: 296215
        },
        {
          name: '2017',
          value: 209122
        }
      ]
    },

    {
      name: 'Japan',
      series: [
        {
          name: '2018',
          value: 257363
        },
        {
          name: '2017',
          value: 205350
        }
      ]
    },

    {
      name: 'Germany',
      series: [
        {
          name: '2018',
          value: 196750
        },
        {
          name: '2017',
          value: 129246
        }
      ]
    },

    {
      name: 'France',
      series: [
        {
          name: '2018',
          value: 204617
        },
        {
          name: '2017',
          value: 149797
        }
      ]
    }
  ];

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
