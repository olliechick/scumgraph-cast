import {Component, NgZone, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

interface PlayerHistory {
  name: string;
  series: { value: number, name: number }[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private ngZone: NgZone, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      if (params.chartdata) {
        this.mode = 'chart';
        this.screen = 'non-tv';

        const chartData = JSON.parse(decodeURIComponent(params.chartdata));
        this.playerHistories = [];
        chartData.slice(1).forEach(playerData => {
          const playerHistory = {name: playerData[0], series: []};
          playerData.slice(1).forEach((score, level) => {
            if (score !== null) {
              playerHistory.series.push({value: score, name: level});
            }
          });
          this.playerHistories.push(playerHistory);
        });
        this.playerHistories = AppComponent.appendScoresToPlayerNames(this.playerHistories);
        this.colourScheme = {domain: chartData[0].map(AppComponent.decimalToAARRGGBBHexTwosComplement)};

        const sortedData = AppComponent.sortPlayersByCurrentScore(this.playerHistories, this.colourScheme.domain);
        this.playerHistories = sortedData[0];
        this.colourScheme.domain = sortedData[1];
      }
    });
  }

  mode: 'none' | 'player-selection' | 'chart' = 'none';
  screen: 'tv' | 'non-tv' = 'tv';

  // Data for player selection mode
  players: { name: string, colour: string }[] = [];
  // Example (for testing): [{name: 'Ollie', colour: '#4363d8'}, {name: 'Mia', colour: '#e6194b'}, {name: 'Noah', colour: '#3cb44b'}];
  rows: { name: string, colour: string, isEmpty: boolean }[][] = [];

  // Data for chart
  playerHistories: PlayerHistory[] = null; // Example (for testing): [
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
  showGridLines = true;
  xScaleMin = 0;

  static padAndChop(str, padChar, length) {
    return (Array(length).fill(padChar).join('') + str).slice(length * -1);
  }

  static decimalToAARRGGBBHexTwosComplement(value) {
    let binaryStr;
    const bitCount = 8 * 4;

    if (value >= 0) {
      const twosComp = value.toString(2);
      binaryStr = AppComponent.padAndChop(twosComp, '0', (bitCount || twosComp.length));
    } else {
      binaryStr = (Math.pow(2, bitCount) + value).toString(2);

      if (Number(binaryStr) < 0) {
        return undefined;
      }
    }

    return '#' + parseInt(binaryStr, 2).toString(16).slice(2);
  }

  static appendScoresToPlayerNames(playerHistories: PlayerHistory[]): PlayerHistory[] {
    playerHistories.forEach(playerHistory => {
      const score = playerHistory.series[playerHistory.series.length - 1].value;
      playerHistory.name = playerHistory.name + ' (score: ' + score.toString() + ')';
    });
    return playerHistories;
  }

  static sortPlayersByCurrentScore(playerHistories: PlayerHistory[], colours: string[]): [PlayerHistory[], string[]] {
    const combined = [];
    for (let i = 0; i < playerHistories.length; i++) {
      combined.push({playerHistory: playerHistories[i], colour: colours[i]});
    }

    combined.sort((c1, c2) => {
      const score1 = c1.playerHistory.series[c1.playerHistory.series.length - 1].value;
      const score2 = c2.playerHistory.series[c2.playerHistory.series.length - 1].value;
      return score2 - score1;
    });

    for (let i = 0; i < combined.length; i++) {
      playerHistories[i] = combined[i].playerHistory;
      colours[i] = combined[i].colour;
    }

    return [playerHistories, colours];
  }

  ngOnInit() {
    this.updateRows();
    const context = cast.framework.CastReceiverContext.getInstance();

    const PLAYER_LIST_CHANNEL = 'urn:x-cast:nz.co.olliechick.scumgraph.playerlist';
    context.addCustomMessageListener(PLAYER_LIST_CHANNEL, customEvent => {
      this.ngZone.run(() => this.mode = 'player-selection');
      const players = customEvent.data.players;
      players.forEach(item => item.colour = AppComponent.decimalToAARRGGBBHexTwosComplement(item.colour));
      this.ngZone.run(() => this.players = players);
      this.updateRows();
    });

    const CHART_CHANNEL = 'urn:x-cast:nz.co.olliechick.scumgraph.chart';

    context.addCustomMessageListener(CHART_CHANNEL, customEvent => {
      this.ngZone.run(() => {
        this.mode = 'chart';

        this.playerHistories = customEvent.data.playerHistories;
        this.playerHistories = AppComponent.appendScoresToPlayerNames(this.playerHistories);
        this.colourScheme = {domain: customEvent.data.colours.map(AppComponent.decimalToAARRGGBBHexTwosComplement)};

        const sortedData = AppComponent.sortPlayersByCurrentScore(this.playerHistories, this.colourScheme.domain);
        this.playerHistories = sortedData[0];
        this.colourScheme.domain = sortedData[1];
      });
    });

    context.start();
  }

  formatAxisTick(value) {
    return Number.isInteger(value) ? value : '';
  }

  updateRows() {
    const emptyRow = [
      {name: '', colour: '', isEmpty: true},
      {name: '', colour: '', isEmpty: true},
      {name: '', colour: '', isEmpty: true},
      {name: '', colour: '', isEmpty: true}
    ];

    const rows: { name: string, colour: string, isEmpty: boolean }[][] = [[...emptyRow]];
    for (let i = 0; i < 4; i++) {
      rows.push([...emptyRow]);
    }

    this.players.forEach((player, i) => {
      rows[Math.floor(i / 4)][i % 4] = {name: player.name, colour: player.colour, isEmpty: false};
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
