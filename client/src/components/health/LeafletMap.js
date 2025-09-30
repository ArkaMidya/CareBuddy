
import 'leaflet/dist/leaflet.css';
import React, { forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

const LeafletMap = forwardRef(({ reports, center = [20.5937, 78.9629], zoom = 5, onMarkerClick }, ref) => {
  // Expose setView via ref
  function MapController() {
    const map = useMap();
    useImperativeHandle(ref, () => ({
      setView: (coords, zoomLevel) => map.setView(coords, zoomLevel)
    }), [map]);
    return null;
  }
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '400px', width: '100%' }}>
      <MapController />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reports.map((report, idx) => {
        // Support both GeoJSON and legacy formats
        let lat, lng;
        if (report.location) {
          // GeoJSON: { type: 'Point', coordinates: [lng, lat] }
          if (report.location.type === 'Point' && Array.isArray(report.location.coordinates)) {
            lng = report.location.coordinates[0];
            lat = report.location.coordinates[1];
          } else if (report.location.coordinates && typeof report.location.coordinates.latitude === 'number' && typeof report.location.coordinates.longitude === 'number') {
            // Legacy: { coordinates: { latitude, longitude } }
            lat = report.location.coordinates.latitude;
            lng = report.location.coordinates.longitude;
          }
        }
        if (typeof lat !== 'number' || typeof lng !== 'number' || lat === 0 || lng === 0) return null;
        return (
          <Marker key={report.id || idx} position={[lat, lng]} eventHandlers={{ click: () => onMarkerClick?.(report) }}>
            <Popup>
              <b>{report.title}</b><br/>
              {report.city}, {report.state}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
});

export default LeafletMap;
