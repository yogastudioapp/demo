Y.use([
  'node-base',
  'event-base',
  'squarespace-util'
], function(Y) {
  var resizer = new Y.Squarespace.ResizeEmitter({
    timeout: 100
  });
  var events = {};

  function bind () {
    setPageHeight();
    edgeDetect();

    events.tweakchange = Y.Global.on('tweak:change', tweakChangeCallback);

    // This is an attempt to manage our Google Maps Static API calls by
    // only loading the map image in the info content only when expanded
    var mapLink = document.querySelector('.map-image a');
    var infoOpen = Y.one('#info-open');

    var gm = window.atob('QUl6YVN5RFppS1Ita04zM2tTVW9CVFAyazhsYi10UzUxTWJibjk0');

    var triggerLoadStaticMap = function () {
      var markerLat = mapLink.getAttribute('data-latitude');
      var markerLong = mapLink.getAttribute('data-longitude');
      var mapZoom = mapLink.getAttribute('data-zoom');
      var mapImg = document.createElement('img');
      mapImg.setAttribute('src', '//maps.googleapis.com/maps/api/staticmap?markers=color:white|' + markerLat + ',' + markerLong + '&size=400x200&scale=2&zoom=' + mapZoom + '&style=visibility:simplified|saturation:-100|gamma:0.5&sensor=false&key=' + gm);
      mapLink.appendChild(mapImg);
      infoOpen.detach('click', triggerLoadStaticMap);
    };

    if (mapLink) {
      infoOpen.on('click', triggerLoadStaticMap);
    }
    if (window.location.hash === '#info-content') {
      triggerLoadStaticMap();
    }
  }

  function loadImages () {
    Y.all('img[data-src]').each(function (img) {
      ImageLoader.load(img)
    });
  }

  function setPageHeight () {
    if (!Y.one('#page') || !Y.one('#sidebar')) {
      return false;
    }

    Y.one('#page').setStyles({
      minHeight: Y.one('#sidebar').get('clientHeight')
    });
  }

  function edgeDetect () {
    var rect;

    Y.all('.main-nav .subnav').each(function (subnav) {
      rect = subnav.getDOMNode().getBoundingClientRect();

      if (rect.right > Y.config.win.innerWidth) {
        subnav.addClass('is--overflowing-window');
      }
    });
  }

  function tweakChangeCallback (f) {
    var tweakName = f.getName();

    if (tweakName == 'blogSidebarWidth' ) {
      setPageHeight();
    }

    if (tweakName == 'page-banner-full-width' ) {
      loadImages();
    }
  }

  function destructor () {
    Y.each(events, function (event) {
      event.detach();
      event = null;
    }, this);
    events = null;

    resizer.destructor();
    resizer = null;
  }

  events.domready     = Y.on('domready', bind);
  events.resizeend    = resizer.on('resize:end', loadImages);
  events.beforeUnload = Y.one(window).on('beforeunload', destructor);
});
