# Scum graph cast

A Chromecast receiver app used by the Android app Scum graph, currently being developed at https://github.com/olliechick/scumgraph.

This website is hosted at https://olliechick.co.nz/scumgraph-cast.

## Usage

The app uses this website to display data on the Chromecast.

You can also display graphs on this page by adding the query parameter `chartdata` (the app will soon have the ability to generate a URL with this query parameter containing the data from the current game). It should be in the format `[colours,player1,player2, ...]`, as explained below:

| Component | Format |
| ---- | ------ |
| `colours` | `[colour1,colour2,colour3]`
| `colour<n>` | number (negative two's complement of the colour hexcode)
| `player<n>` | `[name,score1,score2,...]`
| `name` | string
| `score<n>` | number

For example:
```json
[
  [-12360744,-1697461,-12798901],
  ["Ollie",0, 1, 2, 3, 3],
  ["Mia",  0, 0, 0,-1,-2],
  ["Noah", 0,-1,-2,-2,-1]
]
```
Special characters have to be encoded, so the resulting URL would be http://localhost:4200/?chartdata=%5B%5B-12360744,-1697461,-12798901%5D,%5B%22Ollie%22,0,1,2,3,3%5D,%5B%22Mia%22,0,0,0,-1,-2%5D,%5B%22Noah%22,0,-1,-2,-2,-1%5D%5D

## Development

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Screenshots

| Android | TV |
|----|---|
| ![phone1a](https://user-images.githubusercontent.com/6047072/84731266-70edd980-afec-11ea-88fd-de2fefce372e.png) | ![tv2a](https://user-images.githubusercontent.com/6047072/84731119-f9b84580-afeb-11ea-8951-81f0d4b2f13d.png) |
| ![phone2a](https://user-images.githubusercontent.com/6047072/84731264-6fbcac80-afec-11ea-9ee3-91b5f27756d8.png) | ![tv1a](https://user-images.githubusercontent.com/6047072/84731121-fa50dc00-afeb-11ea-873e-8ca3394b997a.png) |
