# canvas-scratch
JavaScript plugin for scratch effect.

![Demo](/demo_image.png)

## Usage

### Install:

    ... just manual. for now.
    ...

### Example:

```javascript
scratch({
    wrapper: document.getElementById('scratch'),
    imageUrl: 'scratch.jpg',
    lineWidth: 60,
    useBrush: true,
    autoScratch: true,
    mode: scratch.MODE_WITHOUT_MOUSEDOWN,
    onInit: function() { ... },
    onComplete: function() { ... },
    onScratch: function(e) {
        // e.percent
    }
});
```

## Configuration

<i>DOMElement</i> <b>wrapper</b> (required) - a DOM element where the canvas will be placed.

<i>string</i> <b>imageUrl</b> (required) - path to an image that will be scratched. Canvas will be resized to the image width & height.

<i>int</i> <b>lineWidth</b> (optional)

<i>boolean</i> <b>useBrush</b> (optional)

<i>boolean</i> <b>autoScratch</b> (optional)

<i>object</i> <b>autoScratch: {delay: 5000}</b> (optional) - delay in miliseconds

<b>mode</b> (required):
* scratch.MODE_WITH_MOUSEDOWN
* scratch.MODE_WITHOUT_MOUSEDOWN

<i>function</i> <b>onInit</b> (optional) - called when the image is loaded and canvas created.

<i>function</i> <b>onComplete</b> (optional) - called when user scratched the hole image.

<i>function</i> <b>onScratch(event)</b> (optional) - called every scratch movement. <var>event</var> object contains <var>x</var>, <var>y</var> and <var>percent</var> properties.


## Browser requirements

* [Canvas support](http://caniuse.com/#feat=canvas)

## License

MIT
