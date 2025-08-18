import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Ensure marker images load correctly
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

const MapPicker = ({ value, onChange, defaultCenter = { lat: 20.5937, lng: 78.9629 }, zoom = 5 }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const idRef = useRef(`mappicker-${Math.random().toString(36).slice(2, 9)}`);

  // apply default icon (fixes missing pin issue)
  useEffect(() => {
    const DefaultIcon = L.icon({
      iconUrl: markerIconUrl,
      shadowUrl: markerShadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  const createPinIcon = () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <path fill="#d00" d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>
      </svg>`;
    return L.divIcon({ html: svg, className: '', iconSize: [24, 36], iconAnchor: [12, 36] });
  };

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map(idRef.current, { center: [defaultCenter.lat, defaultCenter.lng], zoom, scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // place initial marker if value provided
      if (value && value.lat && value.lng) {
        const icon = createPinIcon();
        markerRef.current = L.marker([value.lat, value.lng], { draggable: true, icon }).addTo(mapRef.current);
        markerRef.current.on('dragend', function (ev) {
          const pos = ev.target.getLatLng();
          onChange && onChange({ lat: pos.lat, lng: pos.lng });
        });
        mapRef.current.panTo([value.lat, value.lng]);
      }

      mapRef.current.on('click', function (e) {
        const { lat, lng } = e.latlng;
        const icon = createPinIcon();
        if (!markerRef.current) {
          markerRef.current = L.marker([lat, lng], { draggable: true, icon }).addTo(mapRef.current);
          markerRef.current.on('dragend', function (ev) {
            const pos = ev.target.getLatLng();
            onChange && onChange({ lat: pos.lat, lng: pos.lng });
          });
        } else {
          markerRef.current.setLatLng([lat, lng]);
          if (markerRef.current.setIcon) markerRef.current.setIcon(icon);
        }
        onChange && onChange({ lat, lng });
      });

      setTimeout(() => { try { mapRef.current.invalidateSize(); } catch (e) {} }, 200);

      const onResize = () => { try { mapRef.current && mapRef.current.invalidateSize(); } catch (e) {} };
      window.addEventListener('resize', onResize);
      mapRef.current._cleanupResize = () => window.removeEventListener('resize', onResize);
    }

    return () => {
      if (mapRef.current) {
        if (mapRef.current._cleanupResize) mapRef.current._cleanupResize();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (value && value.lat && value.lng) {
      const latlng = [value.lat, value.lng];
      const icon = createPinIcon();
      if (!markerRef.current) {
        markerRef.current = L.marker(latlng, { draggable: true, icon }).addTo(mapRef.current);
        markerRef.current.on('dragend', function (ev) {
          const pos = ev.target.getLatLng();
          onChange && onChange({ lat: pos.lat, lng: pos.lng });
        });
      } else {
        markerRef.current.setLatLng(latlng);
        if (markerRef.current.setIcon) markerRef.current.setIcon(icon);
      }
      mapRef.current.invalidateSize && mapRef.current.invalidateSize();
      mapRef.current.panTo(latlng);
    }
  }, [value]);

  return (
    <Box>
      <Box id={idRef.current} sx={{ width: '100%', height: 300, borderRadius: 1, mt: 1 }} />
      <Typography variant="caption" color="text.secondary">Click map to set location; drag marker to adjust.</Typography>
    </Box>
  );
};

export default MapPicker;


