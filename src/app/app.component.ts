import {Component, NgZone, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {
  }

  ngOnInit() {
    const context = cast.framework.CastReceiverContext.getInstance();

    const PLAYER_LIST_CHANNEL = 'urn:x-cast:nz.co.olliechick.scumgraph.playerlist';
    context.addCustomMessageListener(PLAYER_LIST_CHANNEL, customEvent => {
      this.router.navigate(['/player-selection']);
    });

    const CHART_CHANNEL = 'urn:x-cast:nz.co.olliechick.scumgraph.chart';
    context.addCustomMessageListener(CHART_CHANNEL, customEvent => {
      this.router.navigate(['/chart']);
    });

    context.start();
  }
}
