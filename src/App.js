import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  Autocomplete,
  DirectionsRenderer,
  HeatmapLayer,
  DrawingManager,
  Polygon,
} from '@react-google-maps/api';

const libraries = ['places', 'drawing', 'visualization'];
const mapContainerStyle = { width: '100%', height: '100vh' };
const defaultCenter = { lat: 3.139, lng: 101.6869 }; // Kuala Lumpur

// Enhanced map style
const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

// Mock data for demonstration
const generateMockProperties = () => {
  const propertyTypes = ['Condo', 'Landed House', 'Apartment', 'Townhouse', 'Villa'];
  const schoolDistricts = ['Mont Kiara', 'KLCC', 'Bangsar', 'Sri Hartamas', 'Damansara'];
  const features = ['pool', 'gym', 'parking', 'security', 'playground', 'garden'];
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Property ${i + 1}`,
    lat: 3.139 + (Math.random() - 0.5) * 0.1,
    lng: 101.6869 + (Math.random() - 0.5) * 0.1,
    price: Math.floor(Math.random() * 2000000) + 300000,
    size: Math.floor(Math.random() * 2000) + 800,
    lotSize: Math.floor(Math.random() * 5000) + 1000,
    yearBuilt: Math.floor(Math.random() * 30) + 1994,
    propertyType: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
    schoolDistrict: schoolDistricts[Math.floor(Math.random() * schoolDistricts.length)],
    features: features.slice(0, Math.floor(Math.random() * 4) + 2),
    walkScore: Math.floor(Math.random() * 40) + 60,
    priceHistory: generatePriceHistory(),
    description: `Beautiful property in ${schoolDistricts[Math.floor(Math.random() * schoolDistricts.length)]} area.`,
    imageUrl: `https://picsum.photos/300/200?random=${i}`
  }));
};

const generatePriceHistory = () => {
  const basePrice = Math.floor(Math.random() * 2000000) + 300000;
  const history = [];
  for (let i = 0; i < 12; i++) {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    const variation = (Math.random() - 0.5) * 0.1;
    history.unshift({
      date: month.toISOString().slice(0, 7),
      price: Math.floor(basePrice * (1 + variation))
    });
  }
  return history;
};

const mockProperties = generateMockProperties();

// Mock market trends data
const generateMarketTrends = () => {
  const areas = [
    { name: 'Mont Kiara', center: { lat: 3.1724, lng: 101.6508 }, appreciation: 8.5 },
    { name: 'KLCC', center: { lat: 3.1578, lng: 101.7123 }, appreciation: 12.3 },
    { name: 'Bangsar', center: { lat: 3.1319, lng: 101.6740 }, appreciation: 6.7 },
    { name: 'Sri Hartamas', center: { lat: 3.1685, lng: 101.6478 }, appreciation: 4.2 },
    { name: 'Damansara', center: { lat: 3.1478, lng: 101.6388 }, appreciation: 7.9 }
  ];
  
  return areas.map(area => ({
    ...area,
    bounds: [
      { lat: area.center.lat + 0.02, lng: area.center.lng - 0.02 },
      { lat: area.center.lat + 0.02, lng: area.center.lng + 0.02 },
      { lat: area.center.lat - 0.02, lng: area.center.lng + 0.02 },
      { lat: area.center.lat - 0.02, lng: area.center.lng - 0.02 }
    ],
    color: area.appreciation > 10 ? '#4CAF50' : area.appreciation > 5 ? '#FF9800' : '#F44336'
  }));
};

export default function GeoHomePro() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'demo-key',
    libraries,
  });

  // Enhanced state management
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(12);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [directions, setDirections] = useState(null);
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [distanceInfo, setDistanceInfo] = useState('');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [placeType, setPlaceType] = useState('school');
  const [heatmapData, setHeatmapData] = useState([]);
  const [allProperties] = useState(mockProperties);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Enhanced property filters
  const [propertyFilters, setPropertyFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minSize: '',
    maxSize: '',
    minLotSize: '',
    maxLotSize: '',
    minYearBuilt: '',
    maxYearBuilt: '',
    propertyType: '',
    schoolDistrict: '',
    features: [],
    minWalkScore: 60
  });

  // New state for enhanced features
  const [savedSearches, setSavedSearches] = useState([]);
  const [showMarketTrends, setShowMarketTrends] = useState(false);
  const [marketTrends] = useState(generateMarketTrends());
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [emailNotifications, setEmailNotifications] = useState('');

  // New state for saved properties
  const [savedProperties, setSavedProperties] = useState([]);
  const [showSavedProperties, setShowSavedProperties] = useState(false);

  // Data layers state
  const [dataLayers] = useState([]);
  const [visibleLayers, setVisibleLayers] = useState({
    'Public Transport': true,
    'Crime Hotspot': true,
    'Flood Prone': true,
  });

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Enhanced filtering logic
  const filteredProperties = useMemo(() => {
    return allProperties.filter(property => {
      const minPrice = Number(propertyFilters.minPrice) || 0;
      const maxPrice = Number(propertyFilters.maxPrice) || Infinity;
      const minSize = Number(propertyFilters.minSize) || 0;
      const maxSize = Number(propertyFilters.maxSize) || Infinity;
      const minLotSize = Number(propertyFilters.minLotSize) || 0;
      const maxLotSize = Number(propertyFilters.maxLotSize) || Infinity;
      const minYearBuilt = Number(propertyFilters.minYearBuilt) || 1900;
      const maxYearBuilt = Number(propertyFilters.maxYearBuilt) || new Date().getFullYear();

      const priceMatch = property.price >= minPrice && property.price <= maxPrice;
      const sizeMatch = property.size >= minSize && property.size <= maxSize;
      const lotSizeMatch = property.lotSize >= minLotSize && property.lotSize <= maxLotSize;
      const yearMatch = property.yearBuilt >= minYearBuilt && property.yearBuilt <= maxYearBuilt;
      const typeMatch = !propertyFilters.propertyType || property.propertyType === propertyFilters.propertyType;
      const districtMatch = !propertyFilters.schoolDistrict || property.schoolDistrict === propertyFilters.schoolDistrict;
      const walkScoreMatch = property.walkScore >= propertyFilters.minWalkScore;
      const featureMatch = propertyFilters.features.every(f => property.features?.includes(f));

      return priceMatch && sizeMatch && lotSizeMatch && yearMatch && typeMatch && districtMatch && walkScoreMatch && featureMatch;
    });
  }, [allProperties, propertyFilters]);

  // Fetch nearby places when location or place type changes
  useEffect(() => {
    if (!mapRef.current || !markerPosition) return;
    
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.nearbySearch(
      { 
        location: markerPosition, 
        radius: 2000, // Reduced radius for more relevant results
        type: placeType 
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          // Sort by rating and limit to top 8 results
          const sortedResults = results
            .filter(place => place.rating && place.rating >= 3.0) // Filter for quality places
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 8);
          
          setNearbyPlaces(sortedResults);
          const heatmapPoints = sortedResults.map(p => 
            new window.google.maps.LatLng(p.geometry.location.lat(), p.geometry.location.lng())
          );
          setHeatmapData(heatmapPoints);
        } else {
          setNearbyPlaces([]);
          setHeatmapData([]);
        }
      }
    );
  }, [markerPosition, placeType]);

  // Event handlers
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place.geometry || !place.geometry.location) {
      alert('Invalid location selected. Please choose from the dropdown.');
      return;
    }
    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    setMapCenter(location);
    setMarkerPosition(location);
    setZoom(14);
    setDirections(null);
    setDistanceInfo('');
  };

  const getDirectionsToPlace = (destination) => {
    if (!destination.geometry || !destination.geometry.location) return;
    const destLatLng = {
        lat: destination.geometry.location.lat(),
        lng: destination.geometry.location.lng()
    };
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: markerPosition,
        destination: destLatLng,
        travelMode: window.google.maps.TravelMode[travelMode],
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
          const leg = result.routes[0].legs[0];
          setDistanceInfo(`${leg.distance?.text} (${leg.duration?.text})`);
        } else {
          setDirections(null);
          setDistanceInfo('');
          alert('Could not calculate directions.');
        }
      }
    );
  };

  const handleFeatureToggle = (feature) => {
    setPropertyFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const saveSearch = () => {
    if (!searchName.trim()) {
      alert('Please enter a search name');
      return;
    }
    const newSearch = {
      id: Date.now(),
      name: searchName,
      filters: { ...propertyFilters },
      email: emailNotifications,
      createdAt: new Date().toISOString(),
      resultCount: filteredProperties.length
    };
    setSavedSearches([...savedSearches, newSearch]);
    setShowSaveSearchModal(false);
    setSearchName('');
    setEmailNotifications('');
    alert('Search saved successfully!');
  };

  const loadSavedSearch = (search) => {
    setPropertyFilters(search.filters);
    alert(`Loaded search: ${search.name}`);
  };

  const deleteSavedSearch = (searchId) => {
    setSavedSearches(prev => prev.filter(s => s.id !== searchId));
  };

  // Property saving functions
  const saveProperty = (property) => {
    const isAlreadySaved = savedProperties.some(p => p.id === property.id);
    if (isAlreadySaved) {
      setSavedProperties(prev => prev.filter(p => p.id !== property.id));
      alert('Property removed from saved list');
    } else {
      setSavedProperties(prev => [...prev, { ...property, savedAt: new Date().toISOString() }]);
      alert('Property saved successfully!');
    }
  };

  const isPropertySaved = (propertyId) => {
    return savedProperties.some(p => p.id === propertyId);
  };

  const removeSavedProperty = (propertyId) => {
    setSavedProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  const getWalkScoreColor = (score) => {
    if (score >= 90) return '#00C853';
    if (score >= 70) return '#64DD17';
    if (score >= 50) return '#FFC107';
    if (score >= 25) return '#FF9800';
    return '#F44336';
  };

  const getWalkScoreLabel = (score) => {
    if (score >= 90) return 'Walker\'s Paradise';
    if (score >= 70) return 'Very Walkable';
    if (score >= 50) return 'Somewhat Walkable';
    if (score >= 25) return 'Car-Dependent';
    return 'Car-Dependent';
  };

  // UI Components
  const Section = ({ title, icon, children, defaultOpen = false }) => (
    <details open={defaultOpen} className="sidebar-section">
      <summary>
        {icon}
        <span style={{ fontWeight: 600 }}>{title}</span>
        <div className="chevron">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </summary>
      <div className="sidebar-section-content">{children}</div>
    </details>
  );

  const icons = {
    search: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    filters: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.46L22 3z"></path></svg>,
    layers: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
    routes: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="5" x2="6" y2="17"></line><polyline points="14 5 18 5 18 9"></polyline><line x1="6" y1="7" x2="18" y2="19"></line><polyline points="10 19 6 19 6 15"></polyline></svg>,
    trends: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
    save: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17,21 17,13 7,13 7,21"></polyline><polyline points="7,3 7,8 15,8"></polyline></svg>,
    heart: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    .sidebar-container { scrollbar-width: thin; scrollbar-color: #555 #2c3038; }
    .sidebar-container::-webkit-scrollbar { width: 8px; }
    .sidebar-container::-webkit-scrollbar-track { background: #2c3038; }
    .sidebar-container::-webkit-scrollbar-thumb { background-color: #555; border-radius: 6px; border: 2px solid #2c3038; }
    .sidebar-section { background: #2c3038; border-radius: 8px; overflow: hidden; margin-bottom: 15px; }
    .sidebar-section summary { display: flex; align-items: center; gap: 10px; padding: 15px; cursor: pointer; list-style: none; font-size: 16px; color: #fff; }
    .sidebar-section summary::-webkit-details-marker { display: none; }
    .sidebar-section .chevron { margin-left: auto; transition: transform 0.2s; }
    .sidebar-section[open] .chevron { transform: rotate(180deg); }
    .sidebar-section-content { padding: 0 15px 15px 15px; border-top: 1px solid #444; }
    .input-field, .select-field { width: 100%; background: #1f2328; color: #e0e0e0; border: 1px solid #444; border-radius: 6px; padding: 10px; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
    .input-field:focus, .select-field:focus { border-color: #00aaff; }
    .input-field::placeholder { color: #888; }
    .number-input { -moz-appearance: textfield; width: 100%; }
    .number-input::-webkit-outer-spin-button, .number-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    .number-input:focus { outline: none; border-color: #00aaff; }
    .saved-property-item { background: #1f2328; padding: 12px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #333; }
    .property-actions { display: flex; gap: 8px; margin-top: 8px; }
    .save-btn { background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; transition: background 0.2s; }
    .save-btn:hover { background: #45a049; }
    .save-btn.saved { background: #FF9800; }
    .save-btn.saved:hover { background: #f57c00; }
    .property-price { color: #00aaff; font-weight: bold; font-size: 14px; }
    .primary-btn { display: flex; justify-content: center; align-items: center; gap: 8px; width: 100%; background: #00aaff; color: white; padding: 10px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .primary-btn:hover { background: #0095e0; }
    .secondary-btn { display: flex; justify-content: center; align-items: center; gap: 8px; width: 100%; background: #404652; color: white; padding: 10px; border-radius: 6px; border: none; font-weight: 500; cursor: pointer; transition: background 0.2s; }
    .secondary-btn:hover { background: #505866; }
    .label-text { font-size: 14px; font-weight: 500; color: #aaa; display: block; margin-bottom: 8px; margin-top: 12px; }
    .filter-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .walkability-bar { height: 8px; border-radius: 4px; margin: 5px 0; position: relative; overflow: hidden; }
    .walkability-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: #2c3038; padding: 25px; border-radius: 12px; width: 90%; max-width: 400px; color: white; }
    .saved-search-item { background: #1f2328; padding: 12px; border-radius: 6px; margin-bottom: 8px; }
    .search-stats { font-size: 12px; color: #888; margin-top: 5px; }
    .delete-btn { background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; margin-left: 8px; }
  `;

  if (loadError) return <div style={{color: 'white', padding: '20px'}}>Error loading maps</div>;
  if (!isLoaded) return <div style={{color: 'white', padding: '20px'}}>Loading Maps...</div>;

  return (
    <div style={{ display: 'flex', background: '#1f2328' }}>
      <style>{css}</style>
      
      {/* Save Search Modal */}
      {showSaveSearchModal && (
        <div className="modal-overlay" onClick={() => setShowSaveSearchModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0' }}>Save Search</h3>
            <input
              type="text"
              placeholder="Search name"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              className="input-field"
              style={{ marginBottom: '15px' }}
            />
            <input
              type="email"
              placeholder="Email for notifications (optional)"
              value={emailNotifications}
              onChange={e => setEmailNotifications(e.target.value)}
              className="input-field"
              style={{ marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={saveSearch} className="primary-btn">Save</button>
              <button onClick={() => setShowSaveSearchModal(false)} className="secondary-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="sidebar-container" style={{ width: 400, height: '100vh', overflowY: 'auto', background: '#1f2328', padding: '20px', fontFamily: "'Inter', sans-serif" }}>
        
        <div style={{ marginBottom: '25px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff', margin: 0 }}>GeoHome Pro</h1>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>Enhanced Real Estate & Market Analysis</p>
        </div>
        
        {/* Location Search */}
        <div style={{ background: '#2c3038', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 15px 0', fontSize: '16px', color: '#fff', fontWeight: 600 }}>
            {icons.search} Location Search
          </h2>
          <Autocomplete onLoad={ac => (autocompleteRef.current = ac)} onPlaceChanged={onPlaceChanged}>
            <input type="text" placeholder="Search a location..." className="input-field" />
          </Autocomplete>
        </div>

        {/* Enhanced Property Filters */}
        <Section title="Advanced Property Filters" icon={icons.filters} defaultOpen>
          <label className="label-text">Price Range (RM)</label>
          <div className="filter-grid">
            <input
              type="text"
              inputMode="numeric"
              value={propertyFilters.minPrice}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '');
                setPropertyFilters({...propertyFilters, minPrice: value});
              }}
              placeholder="Min Price"
              className="input-field number-input"
              autoComplete="off"
            />
            <input
              type="text"
              inputMode="numeric"
              value={propertyFilters.maxPrice}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '');
                setPropertyFilters({...propertyFilters, maxPrice: value});
              }}
              placeholder="Max Price"
              className="input-field number-input"
              autoComplete="off"
            />
          </div>

          <label className="label-text">Size (sqft)</label>
          <div className="filter-grid">
            <input
              type="text"
              inputMode="numeric"
              value={propertyFilters.minSize}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '');
                setPropertyFilters({...propertyFilters, minSize: value});
              }}
              placeholder="Min Size"
              className="input-field number-input"
              autoComplete="off"
            />
            <input
              type="text"
              inputMode="numeric"
              value={propertyFilters.maxSize}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '');
                setPropertyFilters({...propertyFilters, maxSize: value});
              }}
              placeholder="Max Size"
              className="input-field number-input"
              autoComplete="off"
            />
          </div>

          <label className="label-text">Lot Size (sqft)</label>
          <div className="filter-grid">
            <input
              type="text"
              inputMode="numeric"
              value={propertyFilters.minLotSize}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '');
                setPropertyFilters({...propertyFilters, minLotSize: value});
              }}
              placeholder="Min Lot Size"
              className="input-field number-input"
              autoComplete="off"
            />
            <input
              type="text"
              inputMode="numeric"
              value={propertyFilters.maxLotSize}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '');
                setPropertyFilters({...propertyFilters, maxLotSize: value});
              }}
              placeholder="Max Lot Size"
              className="input-field number-input"
              autoComplete="off"
            />
          </div>

          <label className="label-text">Year Built</label>
          <div className="filter-grid">
            <input
              type="text"
              inputMode="numeric"
              value={propertyFilters.minYearBuilt}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 4) {
                  setPropertyFilters({...propertyFilters, minYearBuilt: value});
                }
              }}
              placeholder="Min Year (e.g., 2000)"
              className="input-field number-input"
              maxLength="4"
              autoComplete="off"
            />
            <input
              type="text"
              inputMode="numeric"
              value={propertyFilters.maxYearBuilt}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 4) {
                  setPropertyFilters({...propertyFilters, maxYearBuilt: value});
                }
              }}
              placeholder="Max Year (e.g., 2024)"
              className="input-field number-input"
              maxLength="4"
              autoComplete="off"
            />
          </div>

          <label className="label-text">Property Type</label>
          <select
            value={propertyFilters.propertyType}
            onChange={e => setPropertyFilters({...propertyFilters, propertyType: e.target.value})}
            className="select-field"
          >
            <option value="">All Types</option>
            <option value="Condo">Condo</option>
            <option value="Landed House">Landed House</option>
            <option value="Apartment">Apartment</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Villa">Villa</option>
          </select>

          <label className="label-text">School District</label>
          <select
            value={propertyFilters.schoolDistrict}
            onChange={e => setPropertyFilters({...propertyFilters, schoolDistrict: e.target.value})}
            className="select-field"
          >
            <option value="">All Districts</option>
            <option value="Mont Kiara">Mont Kiara</option>
            <option value="KLCC">KLCC</option>
            <option value="Bangsar">Bangsar</option>
            <option value="Sri Hartamas">Sri Hartamas</option>
            <option value="Damansara">Damansara</option>
          </select>

          <label className="label-text">Walk Score (Walkability)</label>
          <div style={{ padding: '10px 0' }}>
            <input
              type="range"
              min="0"
              max="100"
              value={propertyFilters.minWalkScore}
              onChange={e => setPropertyFilters({...propertyFilters, minWalkScore: parseInt(e.target.value)})}
              style={{ width: '100%', accentColor: '#00aaff' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa', marginTop: '5px' }}>
              <span>Car-Dependent (0)</span>
              <span style={{ color: getWalkScoreColor(propertyFilters.minWalkScore), fontWeight: 'bold' }}>
                {propertyFilters.minWalkScore}+
              </span>
              <span>Walker's Paradise (100)</span>
            </div>
          </div>

          <label className="label-text">Features</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {['pool', 'gym', 'parking', 'security', 'playground', 'garden'].map(feature => (
              <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  id={`feat-${feature}`}
                  type="checkbox"
                  checked={propertyFilters.features.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  style={{ accentColor: '#00aaff' }}
                />
                <label htmlFor={`feat-${feature}`} style={{ color: '#e0e0e0', fontSize: '14px', textTransform: 'capitalize' }}>
                  {feature}
                </label>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setShowSaveSearchModal(true)} className="primary-btn">
              {icons.save} Save Search
            </button>
          </div>
          
          <div style={{ marginTop: '15px', padding: '10px', background: '#1f2328', borderRadius: '6px' }}>
            <div style={{ fontSize: '14px', color: '#00aaff', fontWeight: 'bold' }}>
              {filteredProperties.length} properties match your criteria
            </div>
          </div>
        </Section>

        {/* Saved Properties */}
        <Section title={`Saved Properties (${savedProperties.length})`} icon={icons.heart}>
          {savedProperties.length === 0 ? (
            <div style={{ 
              background: '#1f2328', 
              padding: '15px', 
              borderRadius: '6px', 
              textAlign: 'center',
              border: '1px dashed #444'
            }}>
              <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
                💝 No saved properties yet
              </p>
              <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
                Click the heart button on any property to save it
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {savedProperties.map(property => (
                <div key={property.id} className="saved-property-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: '#fff', fontSize: '14px' }}>{property.title}</strong>
                      <div className="property-price">RM {property.price.toLocaleString()}</div>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>
                        {property.size} sqft • {property.propertyType} • {property.schoolDistrict}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                        💖 Saved: {new Date(property.savedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => removeSavedProperty(property.id)}
                      className="delete-btn"
                      style={{ marginLeft: '8px', fontSize: '11px' }}
                      title="Remove from saved"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="property-actions">
                    <button
                      onClick={() => {
                        setSelectedProperty(property);
                        setMapCenter({ lat: property.lat, lng: property.lng });
                        setZoom(16);
                      }}
                      style={{
                        background: '#00aaff',
                        color: 'white',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      📍 View on Map
                    </button>
                    <button
                      onClick={() => {
                        const walkScore = getWalkScoreLabel(property.walkScore);
                        const features = property.features?.join(', ') || 'None';
                        alert(`🏠 ${property.title}\n💰 RM ${property.price.toLocaleString()}\n📐 ${property.size} sqft\n🚶 Walk Score: ${property.walkScore}/100 (${walkScore})\n🏷️ Features: ${features}\n📍 ${property.schoolDistrict}`);
                      }}
                      style={{
                        background: '#404652',
                        color: 'white',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ℹ️ Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Saved Searches */}
        <Section title="Saved Searches" icon={icons.save}>
          {savedSearches.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#888' }}>No saved searches yet</p>
          ) : (
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {savedSearches.map(search => (
                <div key={search.id} className="saved-search-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#fff', fontSize: '14px' }}>{search.name}</strong>
                      <div className="search-stats">
                        {search.resultCount} results • {new Date(search.createdAt).toLocaleDateString()}
                        {search.email && <span> • 📧 {search.email}</span>}
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => loadSavedSearch(search)}
                        style={{ background: '#00aaff', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', marginRight: '5px' }}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteSavedSearch(search.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Market Trends */}
        <Section title="Market Trends" icon={icons.trends}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e0e0e0', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={showMarketTrends}
                onChange={e => setShowMarketTrends(e.target.checked)}
                style={{ accentColor: '#00aaff' }}
              />
              Show Price Appreciation Areas
            </label>
          </div>
          
          <div style={{ background: '#1f2328', padding: '12px', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '14px' }}>Area Performance (YoY)</h4>
            {marketTrends.map(area => (
              <div key={area.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#e0e0e0', fontSize: '13px' }}>{area.name}</span>
                <span style={{ 
                  color: area.appreciation > 5 ? '#4CAF50' : '#F44336', 
                  fontWeight: 'bold', 
                  fontSize: '13px' 
                }}>
                  {area.appreciation > 0 ? '+' : ''}{area.appreciation}%
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Data Layers */}
        <Section title="Data Layers" icon={icons.layers}>
          {Object.keys(visibleLayers).map(cat => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <input
                id={`layer-${cat}`}
                type="checkbox"
                checked={visibleLayers[cat]}
                onChange={() => setVisibleLayers(prev => ({ ...prev, [cat]: !prev[cat] }))}
                style={{ accentColor: '#00aaff' }}
              />
              <label htmlFor={`layer-${cat}`} style={{ color: '#e0e0e0', fontWeight: '500', fontSize: '14px' }}>
                {cat}
              </label>
            </div>
          ))}
        </Section>

        {/* Nearby & Routes */}
        <Section title="Nearby & Routes" icon={icons.routes}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <select
              value={placeType}
              onChange={e => setPlaceType(e.target.value)}
              className="select-field"
            >
              <option value="school">School</option>
              <option value="restaurant">Restaurant</option>
              <option value="hospital">Hospital</option>
              <option value="park">Park</option>
            </select>
            <select
              value={travelMode}
              onChange={e => setTravelMode(e.target.value)}
              className="select-field"
            >
              <option value="DRIVING">Driving</option>
              <option value="WALKING">Walking</option>
              <option value="TRANSIT">Transit</option>
            </select>
          </div>
          
          {distanceInfo && (
            <p style={{ fontWeight: 'bold', background: '#1f2328', color: '#00aaff', padding: '8px', borderRadius: '6px', fontSize: '14px', margin: '0 0 10px 0' }}>
              {distanceInfo}
            </p>
          )}
          
          <div>
            <h4 style={{ fontSize: '14px', color: '#fff', margin: '0 0 10px 0' }}>
              Nearby {placeType}s ({nearbyPlaces.length} found)
            </h4>
            {nearbyPlaces.length > 0 ? (
              <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
                {nearbyPlaces.map(place => (
                  <div key={place.place_id} style={{ background: '#1f2328', padding: '10px', borderRadius: '6px', marginBottom: '8px', border: '1px solid #333' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                      <strong style={{ color: '#fff', fontSize: '14px', flex: 1, marginRight: '10px' }}>
                        {place.name}
                      </strong>
                      {place.rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span style={{ color: '#FFD700', fontSize: '12px' }}>★</span>
                          <span style={{ color: '#00aaff', fontSize: '12px', fontWeight: 'bold' }}>
                            {place.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ color: '#aaa', fontSize: '12px', marginBottom: '8px' }}>
                      📍 {place.vicinity}
                    </div>
                    
                    {place.types && (
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ 
                          background: '#404652', 
                          color: '#e0e0e0', 
                          padding: '2px 6px', 
                          borderRadius: '3px', 
                          fontSize: '10px',
                          textTransform: 'capitalize'
                        }}>
                          {place.types[0].replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => getDirectionsToPlace(place)} 
                        style={{
                          fontSize: '12px', 
                          padding: '5px 10px', 
                          cursor: 'pointer', 
                          border: '1px solid #00aaff', 
                          background: '#00aaff', 
                          color: '#fff', 
                          borderRadius: '4px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.target.style.background = '#0095e0'}
                        onMouseOut={e => e.target.style.background = '#00aaff'}
                      >
                        🗺️ Get Directions
                      </button>
                      
                      {place.place_id && (
                        <button 
                          onClick={() => {
                            const url = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
                            window.open(url, '_blank');
                          }}
                          style={{
                            fontSize: '12px', 
                            padding: '5px 10px', 
                            cursor: 'pointer', 
                            border: '1px solid #555', 
                            background: '#404652', 
                            color: '#fff', 
                            borderRadius: '4px',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={e => e.target.style.background = '#505866'}
                          onMouseOut={e => e.target.style.background = '#404652'}
                        >
                          🔗 View Details
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                background: '#1f2328', 
                padding: '15px', 
                borderRadius: '6px', 
                textAlign: 'center',
                border: '1px dashed #444'
              }}>
                <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
                  🔍 Search a location to find nearby {placeType}s
                </p>
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* Google Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={zoom}
          onLoad={onMapLoad}
          options={{
            styles: mapStyle,
            mapTypeControl: false,
            streetViewControl: true,
            fullscreenControl: false,
            zoomControlOptions: { position: window.google?.maps?.ControlPosition?.RIGHT_BOTTOM },
            streetViewControlOptions: { position: window.google?.maps?.ControlPosition?.RIGHT_BOTTOM }
          }}
        >
          {/* Main Search Marker */}
          <Marker 
            position={markerPosition} 
            icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }} 
          />

          {/* Market Trend Overlays */}
          {showMarketTrends && marketTrends.map(area => (
            <Polygon
              key={area.name}
              paths={area.bounds}
              options={{
                fillColor: area.color,
                fillOpacity: 0.3,
                strokeColor: area.color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
              onClick={() => {
                alert(`${area.name}: ${area.appreciation > 0 ? '+' : ''}${area.appreciation}% price appreciation`);
              }}
            />
          ))}

          {/* Filtered Property Markers */}
          {filteredProperties.map(property => (
            <Marker
              key={property.id}
              position={{ lat: property.lat, lng: property.lng }}
              icon={{
                url: isPropertySaved(property.id) 
                  ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                  : "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                scaledSize: new window.google.maps.Size(35, 35)
              }}
              onClick={() => setSelectedProperty(property)}
              title={isPropertySaved(property.id) ? `💖 ${property.title} (Saved)` : property.title}
            />
          ))}

          {/* Enhanced Property InfoWindow */}
          {selectedProperty && (
            <InfoWindow
              position={{ lat: selectedProperty.lat, lng: selectedProperty.lng }}
              onCloseClick={() => setSelectedProperty(null)}
            >
              <div style={{ maxWidth: 300, background: 'white', padding: '15px', borderRadius: '8px', color: '#333' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{selectedProperty.title}</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <strong>Price:</strong><br/>
                    RM {selectedProperty.price.toLocaleString()}
                  </div>
                  <div>
                    <strong>Size:</strong><br/>
                    {selectedProperty.size} sqft
                  </div>
                  <div>
                    <strong>Lot Size:</strong><br/>
                    {selectedProperty.lotSize} sqft
                  </div>
                  <div>
                    <strong>Built:</strong><br/>
                    {selectedProperty.yearBuilt}
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <strong>Type:</strong> {selectedProperty.propertyType}<br/>
                  <strong>District:</strong> {selectedProperty.schoolDistrict}
                </div>

                {/* Walk Score Display */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <strong>Walk Score:</strong>
                    <span style={{ 
                      color: getWalkScoreColor(selectedProperty.walkScore), 
                      fontWeight: 'bold' 
                    }}>
                      {selectedProperty.walkScore}/100
                    </span>
                  </div>
                  <div className="walkability-bar" style={{ background: '#e0e0e0' }}>
                    <div 
                      className="walkability-fill"
                      style={{ 
                        width: `${selectedProperty.walkScore}%`,
                        backgroundColor: getWalkScoreColor(selectedProperty.walkScore)
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                    {getWalkScoreLabel(selectedProperty.walkScore)}
                  </div>
                </div>

                {/* Features */}
                {selectedProperty.features && selectedProperty.features.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Features:</strong><br/>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                      {selectedProperty.features.map(feature => (
                        <span key={feature} style={{ 
                          background: '#e3f2fd', 
                          color: '#1976d2', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '12px',
                          textTransform: 'capitalize'
                        }}>
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p style={{ fontSize: '14px', margin: '10px 0' }}>{selectedProperty.description}</p>
                
                {/* Save Property Button */}
                <div style={{ marginBottom: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveProperty(selectedProperty);
                    }}
                    style={{ 
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      background: isPropertySaved(selectedProperty.id) ? '#FF6B6B' : '#4ECDC4',
                      color: 'white'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {isPropertySaved(selectedProperty.id) ? (
                      <>
                        <span style={{ fontSize: '16px' }}>❤️</span>
                        <span>Saved - Click to Remove</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '16px' }}>🤍</span>
                        <span>Save This Property</span>
                      </>
                    )}
                  </button>
                </div>
                
                {selectedProperty.imageUrl && (
                  <img 
                    src={selectedProperty.imageUrl} 
                    alt={selectedProperty.title} 
                    style={{ width: "100%", borderRadius: '4px', marginTop: '10px' }} 
                  />
                )}
              </div>
            </InfoWindow>
          )}

          {/* Additional overlays */}
          {directions && (
            <DirectionsRenderer 
              directions={directions} 
              options={{ 
                polylineOptions: { 
                  strokeColor: '#00aaff', 
                  strokeWeight: 6 
                } 
              }} 
            />
          )}
          
          {heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}
          
          <DrawingManager
            options={{
              drawingControl: true,
              drawingControlOptions: {
                position: window.google?.maps?.ControlPosition?.TOP_CENTER,
                drawingModes: ['polygon'],
              },
              polygonOptions: {
                fillColor: '#00aaff',
                fillOpacity: 0.2,
                strokeWeight: 2,
                strokeColor: '#00aaff',
                clickable: false,
                editable: true,
                zIndex: 1,
              },
            }}
          />
        </GoogleMap>
      </div>
    </div>
  );
}