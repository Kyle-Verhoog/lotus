var user = {};
var map = L.map('map').setView([43.4705876,-80.5550397],17); //Initialize Map to West D WESST DDDD!
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
            { attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);

//var socket = io.connect(location.origin+'arstarst', { port: PORT, transports: ['websocket'] });
var socket = io.connect();
var userLat;
var userLng;
var markers = {};

var UPDATE_INTERVAL = 2500;
var RESET_ALL_INTERVAL = 2*60*1000;
var NUM_OF_MARKERS = 10;
var MARKERS_PATH = 'images/markers/marker-icon';

//if (room != '/')
//    alert(room);

socket.emit('joinRoom', room);

setInterval(function() {
    user.name = document.getElementById('name').value;
    if(user.name != '' && user.name != null)
        updateLocation();
    //TODO add other stuff here if necessary
}, UPDATE_INTERVAL);

user.name = document.getElementById('name').value;
if (user.name != '' && user.name != null)
    getLocation();

function panToREV(){
    map.panTo(new L.LatLng(43.4701088, -80.5540204));
}

function panToMe() {
    map.setView(new L.LatLng(userLat, userLng), 60, {duration: 1.0});
}

function updateLocation(){
    user.name = document.getElementById('name').value;
    if(user.name != "" && user.name != null){
	getLocation();
    } else {
        alert('Ya got a name, boy?');
    }
}

function usePos(pos) {
    user.name = document.getElementById('name').value;
    if(user.name != "" && user.name != null){
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
        document.getElementById('latitude').value = pos.coords.latitude.toFixed(7);
        document.getElementById('longitude').value = pos.coords.longitude.toFixed(7);

	user.name = document.getElementById('name').value;
        user.lat = userLat;
        user.lng = userLng;
        socket.emit('updateLocation', { room: room, name: user.name, location: {lat: user.lat, lng: user.lng }, sendAll: false });
    }
};

function err(err) {
    console.warn('ERROR ' + err.code + ' ' + err.message);
}

if (navigator.geolocation && false)
    posWatcher = navigator.geolocation.watchPosition(function(pos) {
        usePos(pos);
    });

function getLocation() {
    if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition(function(pos) {
            usePos(pos);
        });
};

function addMarker(){
    var markerIcon = L.icon({iconUrl: 'images/drag_marker.png', iconSize:[40,40]});
    var draggableMarker = L.marker(map.getCenter(), {icon: markerIcon, id: markerArray.length}).addTo(map);
    draggableMarker.dragging.enable();
    draggableMarker.on('dragend',markerDropped);
}

function markerDropped(e){
    var id = e.target.options.id;
    var latlng = e.target.getLatLng();
}

socket.on('updateLocation', function(newUser){
    if (newUser.name in markers) {
        markers[newUser.name].setLatLng(new L.LatLng(newUser.location.lat, newUser.location.lng));
        markers[newUser.name].update();
    } else {
	//var rand = Math.floor((Math.random() * NUM_OF_MARKERS) + 1);
        var rand = newUser.name.hashCode() % NUM_OF_MARKERS;
        rand = (rand + NUM_OF_MARKERS) % NUM_OF_MARKERS + 1;
        if (newUser.name == 'Kyle')
            rand = '-KYLE'
	var path = MARKERS_PATH + rand + '.png';
        var markerIcon;
        if (newUser.name == 'Kevin' || newUser.name == 'fb/kevinsuwala') {
            path = 'http://graph.facebook.com/jennayzhong/picture?type=square';
            markerIcon = L.icon({
                iconUrl: path,
                iconSize: [50,50],
                iconAnchor: [25,50],
                popupAnchor: [0,-54],
                className: 'img-circle'});
        } else if (newUser.name == 'Jenny' || newUser.name == 'fb/jennayzhong') {
            path = 'http://graph.facebook.com/kevinsuwala/picture?type=square';
            markerIcon = L.icon({
                iconUrl: path,
                iconSize: [50,50],
                iconAnchor: [25,50],
                popupAnchor: [0,-54],
                className: 'img-circle'});
        } else if (newUser.name.substring(0,3) == 'fb/') {
            path = 'http://graph.facebook.com/' + newUser.name.substring(3,newUser.name.length) + '/picture?type=square';
            markerIcon = L.icon({
                iconUrl: path,
                iconSize: [50,50],
                iconAnchor: [25,50],
                popupAnchor: [0,-54],
                className: 'img-circle'});
        } else {
	    markerIcon = L.icon({
                iconUrl: path,
                shadowUrl: 'images/marker-shadow.png',
                iconSize: [25,41],
                iconAnchor: [12, 41],
                popupAnchor: [0, -45]});
        }
        var marker = L.marker(new L.LatLng(newUser.location.lat, newUser.location.lng),
			      {icon: markerIcon}).addTo(map);
        marker.bindPopup(newUser.name).addTo(map);
        markers[newUser.name] = marker;
    }
});

socket.on('userGone', function(name) {
    map.removeLayer(markers[name]);
    delete markers[name];
});

// http://stackoverflow.com/a/7616484
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
