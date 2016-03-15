function HeatMapTimeLine(parameters) {
  if(parameters.hasOwnProperty('mapId') && parameters.hasOwnProperty('timelineId')) {
  var map = new ol.Map({
    target: parameters['mapId'],
    view: new ol.View({
      center: [-8715044.216962654, 4658378.251811782], //center at DC
      projection: "EPSG:3857",
      zoom: 7
    })
  });
  /*
  this.timelineElements {list{ contains objects of the form:
  {'start': new Date(2012, 4, 25), 'content': 'First'},
  */
this.timelineElements = new vis.DataSet({}); //list of visJS map objects
var mapLayers = {
  layers: [],
  add: function (layer) {
    this.layers.push(layer);
    map.addLayer(layer);
  },
  redraw: function() {
    for (var i = 0; i < this.layers.length; i++) {
    var layer = this.layers[i];

    //  this.add());
    }
  },
  remove: function(layer) {

  }
};

  //JS Object magic to addEventListeners for start and end date changes
  var currentTimeframe = {
     start: 0,
     end: 0,
    set: function(newStart,newEnd){
        start = newStart;
        end = newEnd;
        map.getLayers().clear();
        mapLayers.redraw()
        map.render();

      }
  };
  this.drawTimeline = function (drawPoint) {
    const items = this.timelineElements;

      // create visualization
      var container = document.getElementById(drawPoint);
      var options = {
        height: '300px',
        start: new Date(1860, 0, 1),
        end: new Date(1864, 0, 1),
        min: new Date(1860, 0, 1),                // lower limit of visible range
        max: new Date(1864, 0, 1),                // upper limit of visible range
        zoomMin: 1000 * 60 * 60 * 24,             // one day in milliseconds
        zoomMax: 1000 * 60 * 60 * 24 * 31 * 3     // about three months in milliseconds
      };

      // create the timeline
      var timeline = new vis.Timeline(container);
      timeline.setOptions(options);
      timeline.setItems(items);

      //addEventListeners for timeline
      timeline.on('select', function (properties) {
          console.log(properties);
      });
      timeline.on('rangechanged',function (properties) {
        map.getLayers().clear();
          var currentFeatures =  new ol.source.Vector({ projection: "EPSG:3857" });
          vector.getSource().forEachFeature(function(item){
          //  console.log(item);
            const Item = item['id_'];
            //process date into valid format
            const dateParts = Item.split(" ");
            var month  = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateParts[1]) / 3 ; // convert month string into number
            var date = new Date(dateParts[0],Math.round(month),dateParts[2]);
            if ((properties.start <= date) && (date <= properties.end)) {
              //keep
              currentFeatures.addFeature(item);
            } else {
                //don't display
            }
          },properties);
          currentFeatures.forEachFeature(function(val){console.log(val)});
          var currentHeatMap = new ol.layer.Heatmap({ source: currentFeatures, blur: 35,
          radius: 50 });
          map.addLayer(raster);
          map.addLayer(currentHeatMap);
          map.render();
      });
  };


var vector = new ol.layer.Heatmap({
  source: new ol.source.Vector({
    url: './data/fix.kml',
    projection: "EPSG:3857",
    format: new ol.format.KML({
      extractStyles: false
    })
  }),
  blur: 35,
  radius: 15
});
//
vector.getSource().on('addfeature', function(event) {
  // our KML stores the weight of each feature in a
  // standards-violating  tag in each Placemark.  We extract it from
  // the Placemark's name instead.
  const featureDateRaw = event.feature["id_"]; //get date for timeline
  //process date into valid format
  const dateParts = featureDateRaw.split(" ");
  var month  = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateParts[1]) / 3 ; // convert month string into number
  var date = new Date(dateParts[0],Math.round(month),dateParts[2]);
  //add VisJS Object for feature
  this.timelineElements.add([{
    'start': date,
    'content': featureDateRaw
  }]);
    var name = event.feature.get('name');
    var magnitude = parseFloat(name.substr(2));
    event.feature.set('weight', magnitude*100 - 5);

},this);
//base layer from mapbox
var raster = new ol.layer.Tile({
      source: new ol.source.XYZ({
        tileSize: [512, 512],
        url: 'https://api.mapbox.com/styles/v1/zpg94/cik74z92b00es96kpaatrdczg/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoienBnOTQiLCJhIjoiY2loNnBhcG1jMDR2YnVta2k3Mnczb21ibiJ9.NtJzwHt_WMSDj1N_gc65pw'
      })
    })
//add map layers
mapLayers.add(raster);
mapLayers.add(vector);

this.drawTimeline(parameters.timelineId);
} else  {
  alert("invalid constructor");
}
map.on('singleclick', function(evt) {
    var coordinates = map.getEventCoordinate(evt.originalEvent);
    console.log(coordinates[0], coordinates[1]);
    console.log(ol.proj.transform([coordinates[0], coordinates[1]], 'EPSG:3857', new ol.source.OSM().getProjection()));

}, this);
};
var app =  new HeatMapTimeLine({mapId:"map",timelineId:"timeline"});
