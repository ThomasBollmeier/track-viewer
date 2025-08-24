function parseGPX(gpxContent) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxContent, "application/xml");

    let gpsData = new GPSData();
    parseWaypoints(xmlDoc, gpsData);
    parseRoutes(xmlDoc, gpsData);
    parseTracks(xmlDoc, gpsData);

    return gpsData;
}

function createWayPoint(element) {
    const lat = parseFloat(element.getAttribute("lat"));
    const lon = parseFloat(element.getAttribute("lon"));

    const elevations = element.getElementsByTagName("ele");
    if (elevations.length > 0) {
        const ele = parseFloat(elevations[0].textContent);
        return new WayPoint(lat, lon, ele);
    }
    return new WayPoint(lat, lon);
}

function parseWaypoints(xmlDoc, gpsData) {
    const wptElements = xmlDoc.getElementsByTagName("wpt");
    for (let i = 0; i < wptElements.length; i++) {
        const waypoint = createWayPoint(wptElements[i]);
        gpsData.addWaypoint(waypoint);
    }
}

function parseRoutes(xmlDoc, gpsData) {
    const rteElements = xmlDoc.getElementsByTagName("rte");
    for (let i = 0; i < rteElements.length; i++) {
        const routeName = rteElements[i].getElementsByTagName("name")[0].textContent;
        const route = new Route(routeName);
        const rteptElements = rteElements[i].getElementsByTagName("rtept");
        for (let j = 0; j < rteptElements.length; j++) {
            const waypoint = createWayPoint(rteptElements[j]);
            route.addWaypoint(waypoint);
        }
        gpsData.addRoute(route);
    }
}

function parseTracks(xmlDoc, gpsData) {
    const trkElements = xmlDoc.getElementsByTagName("trk");
    for (let i = 0; i < trkElements.length; i++) {
        const trackName = trkElements[i].getElementsByTagName("name")[0].textContent;
        const track = new Track(trackName);
        const trksegElements = trkElements[i].getElementsByTagName("trkseg");
        for (let j = 0; j < trksegElements.length; j++) {
            const segment = new TrackSegment();
            const trkptElements = trksegElements[j].getElementsByTagName("trkpt");
            for (let k = 0; k < trkptElements.length; k++) {
                const waypoint = createWayPoint(trkptElements[k]);
                segment.addWaypoint(waypoint);
            }
            track.addSegment(segment);
        }
        gpsData.addTrack(track);
    }
}

class WayPoint {
    constructor(lat, lon, ele) {
        this.lat = lat;
        this.lon = lon;
        this.ele = ele;
    }

    static getBorderCoordinates(waypoints) {
        const lats = waypoints.map(wp => wp.lat);
        const lons = waypoints.map(wp => wp.lon);
        return {
            north: Math.max(...lats),
            south: Math.min(...lats),
            east: Math.max(...lons),
            west: Math.min(...lons)
        };
    }

    static getCenter(waypoints) {
        const { north, south, east, west } = WayPoint.getBorderCoordinates(waypoints);
        return {
            lat: (north + south) / 2,
            lon: (east + west) / 2
        };
    }
}

class Route {
    constructor(name) {
        this.name = name;
        this.waypoints = [];
    }

    addWaypoint(waypoint) {
        this.waypoints.push(waypoint);
    }

    getLatLngs() {
        return this.waypoints.map(wp => [wp.lat, wp.lon]);
    }

    get center() {
        return WayPoint.getCenter(this.waypoints);
    }
}

class TrackSegment {
    constructor() {
        this.waypoints = [];
    }

    addWaypoint(waypoint) {
        this.waypoints.push(waypoint);
    }

    getLatLngs() {
        return this.waypoints.map(wp => [wp.lat, wp.lon]);
    }

    get center() {
        return WayPoint.getCenter(this.waypoints);
    }
}

class Track {
    constructor(name) {
        this.name = name;
        this.segments = [];
    }

    addSegment(segment) {
        this.segments.push(segment);
    }

    get center() {
        return WayPoint.getCenter(this.segments.map(seg => seg.center));
    }
}

class GPSData {

    constructor() {
        this.waypoints = [];
        this.routes = [];
        this.tracks = [];
    }

    addWaypoint(waypoint) {
        this.waypoints.push(waypoint);
    }

    addRoute(route) {
        this.routes.push(route);
    }

    addTrack(track) {
        this.tracks.push(track);
    }

    get center() {
        let centers = [];
        if (this.waypoints.length > 0) {
            centers.push(WayPoint.getCenter(this.waypoints));
        }
        if (this.routes.length > 0) {
            centers.push(...this.routes.map(route => route.center));
        }
        if (this.tracks.length > 0) {
            centers.push(...this.tracks.map(track => track.center));
        }
        return WayPoint.getCenter(centers);
    }

}

export {
    parseGPX,
    WayPoint,
    Route,
    Track,
    TrackSegment,
    GPSData
};