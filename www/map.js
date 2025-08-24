function createMapView(gpsData) {

    const { lat, lon } = gpsData.center;
    const zoom = 13;

    //let map = L.map('map').setView([51.505, -0.09], 13);
    let map = L.map('map').setView([lat, lon], zoom);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Add GPX tracks and routes to the map
    gpsData.tracks.forEach(track => {
        track.segments.forEach(segment => {
            const polyline = L.polyline(segment.getLatLngs(), { color: 'blue' });
            polyline.addTo(map);
        });
    });

    gpsData.routes.forEach(route => {
        const polyline = L.polyline(route.getLatLngs(), { color: 'green' });
        polyline.addTo(map);
    });

    return map;
}

export { createMapView };
