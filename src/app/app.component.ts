import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  players: { name: string, colour: string }[] = [];
  rows: { name: string, colour: string }[][] = [];

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
      const players = customEvent.data.players;
      players.forEach(item => item.colour = decimalToAARRGGBBHexTwosComplement(item.colour));
      this.players = players;
      this.updateRows();
    });
    context.start();
  }

  addPlayer() { // for debugging purposes only
    this.players.push({name: 'New player', colour: '#00ffff'});
    this.updateRows();
  }

  updateRows() {
    const emptyRow = [
      {name: ' ', colour: 'white'},
      {name: ' ', colour: 'white'},
      {name: ' ', colour: 'white'},
      {name: ' ', colour: 'white'}
    ];

    const len = Math.floor((this.players.length - 1) / 4);
    console.log('Length:');
    console.log(len);
    const rows: { name: string, colour: string }[][] = [[...emptyRow]];
    for (let i = 0; i < 3; i++) {
      rows.push([...emptyRow]);
    }

    this.players.forEach((player, i) => {
      rows[Math.floor(i / 4)][i % 4] = player;
    });

    this.rows = rows;
  }
}
