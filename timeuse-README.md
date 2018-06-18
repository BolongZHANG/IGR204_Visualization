# IGR204 Visualization project

## `ptime-graph.js`

### Get started
This file manages the display of a scatter plot of (participation time, participation rate) for a given activity. It also offers facilities to get participation rate and time.

All the countries which have data on this activity will be drawn. The graph can be easily inserted into your `html`page giving the following `id` to a `<div>` component.
```html
<div id="activity-graph"></div>
```

### Participation rate and time
To get participation rate and time from a given `country` and a given `activity` just proceed as follows.
```js
let rate = getParticipationRate(country, activity);
let time = getParticipationTime(country, activity);
```
The functions will return the value as a `float` variable, or `NaN` if the value could not be found in the databast.

### Load graph for a particular activity
In order to display data of participant countries of a given `activity`, just call `plotGraphActivity` with the name of the `activity` to be drawn.
```js
plotGraphActivity(activity);
```

### Get or set graph settings
```js
// Sets the graph axis margins into svg box
GRAPHm = value;
// Sets the country labels vertical relative position according to the circles
LABELSm = value;
// Gets a reference to the svg component containing the graph
let svg = GRAPHsvg;
// Store the graph height and width
let height = GRAPHh, width = GRAPHw;
```
