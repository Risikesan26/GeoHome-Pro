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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';

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

// Enhanced mock data generation
const generateMockProperties = () => {
  const propertyTypes = ['Condo', 'Landed House', 'Apartment', 'Townhouse', 'Villa'];
  const schoolDistricts = ['Mont Kiara', 'KLCC', 'Bangsar', 'Sri Hartamas', 'Damansara'];
  const features = ['pool', 'gym', 'parking', 'security', 'playground', 'garden'];
  
  return Array.from({ length: 50 }, (_, i) => {
    const price = Math.floor(Math.random() * 2000000) + 300000;
    const size = Math.floor(Math.random() * 2000) + 800;
    const monthlyRent = Math.floor(price * 0.003 + Math.random() * 1000); // Realistic rent calculation
    const yearBuilt = Math.floor(Math.random() * 30) + 1994;
    const district = schoolDistricts[Math.floor(Math.random() * schoolDistricts.length)];
    
    return {
      id: i + 1,
      title: `Property ${i + 1}`,
      lat: 3.139 + (Math.random() - 0.5) * 0.1,
      lng: 101.6869 + (Math.random() - 0.5) * 0.1,
      price,
      size,
      lotSize: Math.floor(Math.random() * 5000) + 1000,
      yearBuilt,
      propertyType: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
      schoolDistrict: district,
      features: features.slice(0, Math.floor(Math.random() * 4) + 2),
      walkScore: Math.floor(Math.random() * 40) + 60,
      priceHistory: generatePriceHistory(price),
      monthlyRent,
      description: `Beautiful property in ${district} area.`,
      imageUrl: `https://picsum.photos/300/200?random=${i}`,
      // Analytics data
      daysOnMarket: Math.floor(Math.random() * 180) + 10,
      pricePerSqft: Math.floor(price / size),
      appreciation: (Math.random() - 0.3) * 20, // -6% to +14% appreciation
      crimeScore: Math.floor(Math.random() * 40) + 30, // 30-70 (lower is better)
      schoolRating: Math.floor(Math.random() * 3) + 7, // 7-10 rating
      commuteScore: Math.floor(Math.random() * 40) + 60, // 60-100
      investmentGrade: ['A+', 'A', 'A-', 'B+', 'B', 'B-'][Math.floor(Math.random() * 6)]
    };
  });
};

const generatePriceHistory = (currentPrice) => {
  const history = [];
  let price = currentPrice * 0.8; // Start from 80% of current price
  for (let i = 0; i < 24; i++) {
    const month = new Date();
    month.setMonth(month.getMonth() - (23 - i));
    const variation = (Math.random() - 0.4) * 0.05; // Slight upward bias
    price = Math.floor(price * (1 + variation));
    history.push({
      date: month.toISOString().slice(0, 7),
      price: price,
      month: month.toLocaleDateString('en-MY', { month: 'short', year: '2-digit' })
    });
  }
  return history;
};

// Generate market analytics data
const generateMarketAnalytics = () => {
  const months = [];
  const currentDate = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push({
      month: date.toLocaleDateString('en-MY', { month: 'short', year: '2-digit' }),
      averagePrice: Math.floor(Math.random() * 200000) + 800000,
      inventory: Math.floor(Math.random() * 500) + 200,
      salesVolume: Math.floor(Math.random() * 150) + 50,
      daysOnMarket: Math.floor(Math.random() * 30) + 45
    });
  }
  return months;
};

const generateNeighborhoodData = () => {
  const districts = ['Mont Kiara', 'KLCC', 'Bangsar', 'Sri Hartamas', 'Damansara'];
  return districts.map(district => ({
    name: district,
    safetyScore: Math.floor(Math.random() * 30) + 70,
    schoolScore: Math.floor(Math.random() * 30) + 70,
    transportScore: Math.floor(Math.random() * 30) + 60,
    amenitiesScore: Math.floor(Math.random() * 30) + 65,
    overallScore: Math.floor(Math.random() * 20) + 75,
    averagePrice: Math.floor(Math.random() * 500000) + 600000,
    priceGrowth: (Math.random() * 15) + 2
  }));
};

const mockProperties = generateMockProperties();
const marketData = generateMarketAnalytics();
const neighborhoodData = generateNeighborhoodData();

// Enhanced market trends data
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

// Custom Input Component with better number formatting
const NumberInput = ({ value, onChange, placeholder, className }) => {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef(null);
  
  // Update display value when external value changes
  useEffect(() => {
    if (value === '' || value === null || value === undefined) {
      setDisplayValue('');
    } else {
      // Only update if the numeric value is actually different
      const numericValue = value.toString().replace(/,/g, '');
      if (numericValue !== displayValue.replace(/,/g, '')) {
        setDisplayValue(value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
      }
    }
  }, [value]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    // Allow only digits and commas
    const cleanValue = inputValue.replace(/[^\d,]/g, '');
    
    // Remove all commas and reformat
    const numericOnly = cleanValue.replace(/,/g, '');
    
    // Update display value with formatting
    const formatted = numericOnly === '' ? '' : numericOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setDisplayValue(formatted);
    
    // Pass the clean numeric value to parent
    onChange(numericOnly);
    
    // Restore cursor position after formatting
    setTimeout(() => {
      if (inputRef.current) {
        let newPosition = cursorPosition;
        const oldCommas = (inputValue.slice(0, cursorPosition).match(/,/g) || []).length;
        const newCommas = (formatted.slice(0, cursorPosition).match(/,/g) || []).length;
        newPosition += newCommas - oldCommas;
        inputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
    />
  );
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

  // Enhanced property filters - Store as strings to avoid formatting issues
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

  // New state for enhanced features (removed savedSearches)
  const [showMarketTrends, setShowMarketTrends] = useState(false);
  const [marketTrends] = useState(generateMarketTrends());

  // New state for saved properties
  const [savedProperties, setSavedProperties] = useState([]);

  // Analytics Dashboard State
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('market');
  const [investmentParams, setInvestmentParams] = useState({
    downPayment: 20,
    loanTerm: 30,
    interestRate: 4.5,
    monthlyExpenses: 500,
    expectedAppreciation: 5
  });

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Simplified input change handlers
  const handleFilterChange = (field, value) => {
    setPropertyFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleYearChange = (field, value) => {
    // Allow only digits and limit to 4 characters for year fields
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setPropertyFilters(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

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

  // Property recommendation engine  
  const getPropertyRecommendations = useMemo(() => {
    const userPreferences = {
      avgPrice: filteredProperties.reduce((sum, p) => sum + p.price, 0) / filteredProperties.length || 1000000,
      preferredDistricts: propertyFilters.schoolDistrict ? [propertyFilters.schoolDistrict] : [],
      preferredFeatures: propertyFilters.features,
      minWalkScore: propertyFilters.minWalkScore
    };

    return allProperties
      .map(property => {
        let score = 0;
        
        // Price similarity (closer to user's average preference)
        const priceDiff = Math.abs(property.price - userPreferences.avgPrice) / userPreferences.avgPrice;
        score += (1 - Math.min(priceDiff, 1)) * 30;
        
        // District preference
        if (userPreferences.preferredDistricts.includes(property.schoolDistrict)) {
          score += 25;
        }
        
        // Feature matching
        const matchingFeatures = property.features?.filter(f => userPreferences.preferredFeatures.includes(f)).length || 0;
        score += (matchingFeatures / Math.max(userPreferences.preferredFeatures.length, 1)) * 20;
        
        // Walk score
        score += (property.walkScore / 100) * 15;
        
        // Investment metrics
        const grossYield = (property.monthlyRent * 12) / property.price * 100;
        score += Math.min(grossYield * 2, 10); // Max 10 points for yield
        
        return { ...property, recommendationScore: Math.round(score) };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 5);
  }, [allProperties, filteredProperties, propertyFilters]);

  // Investment calculator
  const calculateInvestmentMetrics = (property) => {
    const price = property.price;
    const monthlyRent = property.monthlyRent;
    const downPaymentAmount = price * (investmentParams.downPayment / 100);
    const loanAmount = price - downPaymentAmount;
    
    // Monthly mortgage payment
    const monthlyRate = investmentParams.interestRate / 100 / 12;
    const numPayments = investmentParams.loanTerm * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Cash flow
    const monthlyCashFlow = monthlyRent - monthlyPayment - investmentParams.monthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    
    // ROI calculations
    const grossYield = (monthlyRent * 12) / price * 100;
    const netYield = annualCashFlow / price * 100;
    const cashOnCashReturn = annualCashFlow / downPaymentAmount * 100;
    
    // Future value with appreciation
    const futureValue = price * Math.pow(1 + investmentParams.expectedAppreciation / 100, 10);
    const totalReturn = (futureValue - price + annualCashFlow * 10) / downPaymentAmount * 100;

    return {
      downPaymentAmount,
      monthlyPayment,
      monthlyCashFlow,
      annualCashFlow,
      grossYield,
      netYield,
      cashOnCashReturn,
      futureValue,
      totalReturn
    };
  };

  // Calculate neighborhood score
  const calculateNeighborhoodScore = (property) => {
    const district = neighborhoodData.find(d => d.name === property.schoolDistrict);
    if (!district) return 0;
    
    const weights = {
      safety: 0.3,
      schools: 0.25,
      transport: 0.2,
      amenities: 0.15,
      walkability: 0.1
    };
    
    const score = 
      district.safetyScore * weights.safety +
      district.schoolScore * weights.schools +
      district.transportScore * weights.transport +
      district.amenitiesScore * weights.amenities +
      property.walkScore * weights.walkability;
    
    return Math.round(score);
  };

  // Fetch nearby places when location or place type changes
  useEffect(() => {
    if (!mapRef.current || !markerPosition) return;
    
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.nearbySearch(
      { 
        location: markerPosition, 
        radius: 2000,
        type: placeType 
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const sortedResults = results
            .filter(place => place.rating && place.rating >= 3.0)
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

  const getGradeColor = (grade) => {
    const colors = {
      'A+': '#4CAF50', 'A': '#66BB6A', 'A-': '#81C784',
      'B+': '#FFB74D', 'B': '#FFA726', 'B-': '#FF9800'
    };
    return colors[grade] || '#9E9E9E';
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
    routes: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="5" x2="6" y2="17"></line><polyline points="14 5 18 5 18 9"></polyline><line x1="6" y1="7" x2="18" y2="19"></line><polyline points="10 19 6 19 6 15"></polyline></svg>,
    trends: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
    heart: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
    analytics: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>,
    recommendation: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"></path><path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1"></path><path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1"></path><path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1"></path><path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1"></path></svg>
  };

  // Analytics Dashboard Components
  const AnalyticsModal = () => {
    if (!showAnalytics) return null;

    const COLORS = ['#00aaff', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#795548'];

    const propertyTypeData = filteredProperties.reduce((acc, property) => {
      acc[property.propertyType] = (acc[property.propertyType] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.entries(propertyTypeData).map(([type, count]) => ({
      name: type,
      value: count
    }));

    const priceRangeData = [
      { range: '0-500K', count: filteredProperties.filter(p => p.price < 500000).length },
      { range: '500K-1M', count: filteredProperties.filter(p => p.price >= 500000 && p.price < 1000000).length },
      { range: '1M-1.5M', count: filteredProperties.filter(p => p.price >= 1000000 && p.price < 1500000).length },
      { range: '1.5M+', count: filteredProperties.filter(p => p.price >= 1500000).length }
    ];

    return (
      <div className="modal-overlay" onClick={() => setShowAnalytics(false)}>
        <div className="analytics-modal" onClick={e => e.stopPropagation()}>
          <div className="analytics-header">
            <h2>📊 Analytics Dashboard</h2>
            <button onClick={() => setShowAnalytics(false)} className="close-btn">✕</button>
          </div>
          
          <div className="analytics-tabs">
            <button 
              className={`tab-btn ${activeAnalyticsTab === 'market' ? 'active' : ''}`}
              onClick={() => setActiveAnalyticsTab('market')}
            >
              📈 Market Analytics
            </button>
            <button 
              className={`tab-btn ${activeAnalyticsTab === 'investment' ? 'active' : ''}`}
              onClick={() => setActiveAnalyticsTab('investment')}
            >
              💰 Investment Analysis
            </button>
            <button 
              className={`tab-btn ${activeAnalyticsTab === 'neighborhood' ? 'active' : ''}`}
              onClick={() => setActiveAnalyticsTab('neighborhood')}
            >
              🏘️ Neighborhood Scores
            </button>
            <button 
              className={`tab-btn ${activeAnalyticsTab === 'recommendations' ? 'active' : ''}`}
              onClick={() => setActiveAnalyticsTab('recommendations')}
            >
              🎯 Recommendations
            </button>
          </div>

          <div className="analytics-content">
            {activeAnalyticsTab === 'market' && (
              <div className="analytics-grid">
                <div className="chart-container">
                  <h3>Market Price Trends (12 Months)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={marketData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="month" stroke="#aaa" />
                      <YAxis stroke="#aaa" tickFormatter={(value) => `RM${(value/1000).toFixed(0)}K`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#2c3038', border: '1px solid #444', borderRadius: '6px' }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value) => [`RM${value.toLocaleString()}`, 'Average Price']}
                      />
                      <Line type="monotone" dataKey="averagePrice" stroke="#00aaff" strokeWidth={3} dot={{ fill: '#00aaff', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-container">
                  <h3>Property Type Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#2c3038', border: '1px solid #444', borderRadius: '6px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-container">
                  <h3>Price Range Analysis</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={priceRangeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="range" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#2c3038', border: '1px solid #444', borderRadius: '6px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="count" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-container">
                  <h3>Market Metrics</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={marketData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="month" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#2c3038', border: '1px solid #444', borderRadius: '6px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="inventory" stackId="1" stroke="#FF9800" fill="#FF9800" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="salesVolume" stackId="2" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeAnalyticsTab === 'investment' && (
              <div className="investment-analysis">
                <div className="investment-params">
                  <h3>Investment Parameters</h3>
                  <div className="params-grid">
                    <div>
                      <label>Down Payment (%)</label>
                      <input
                        type="number"
                        value={investmentParams.downPayment}
                        onChange={e => setInvestmentParams(prev => ({...prev, downPayment: parseFloat(e.target.value) || 0}))}
                        className="param-input"
                      />
                    </div>
                    <div>
                      <label>Loan Term (years)</label>
                      <input
                        type="number"
                        value={investmentParams.loanTerm}
                        onChange={e => setInvestmentParams(prev => ({...prev, loanTerm: parseFloat(e.target.value) || 0}))}
                        className="param-input"
                      />
                    </div>
                    <div>
                      <label>Interest Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={investmentParams.interestRate}
                        onChange={e => setInvestmentParams(prev => ({...prev, interestRate: parseFloat(e.target.value) || 0}))}
                        className="param-input"
                      />
                    </div>
                    <div>
                      <label>Monthly Expenses (RM)</label>
                      <input
                        type="number"
                        value={investmentParams.monthlyExpenses}
                        onChange={e => setInvestmentParams(prev => ({...prev, monthlyExpenses: parseFloat(e.target.value) || 0}))}
                        className="param-input"
                      />
                    </div>
                    <div>
                      <label>Expected Appreciation (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={investmentParams.expectedAppreciation}
                        onChange={e => setInvestmentParams(prev => ({...prev, expectedAppreciation: parseFloat(e.target.value) || 0}))}
                        className="param-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="investment-results">
                  <h3>Top Investment Opportunities</h3>
                  <div className="investment-cards">
                    {filteredProperties.slice(0, 3).map(property => {
                      const metrics = calculateInvestmentMetrics(property);
                      return (
                        <div key={property.id} className="investment-card">
                          <div className="investment-header">
                            <h4>{property.title}</h4>
                            <div className="investment-grade" style={{ background: getGradeColor(property.investmentGrade) }}>
                              {property.investmentGrade}
                            </div>
                          </div>
                          
                          <div className="investment-metrics">
                            <div className="metric">
                              <span className="metric-label">Property Price</span>
                              <span className="metric-value">RM {property.price.toLocaleString()}</span>
                            </div>
                            <div className="metric">
                              <span className="metric-label">Down Payment</span>
                              <span className="metric-value">RM {metrics.downPaymentAmount.toLocaleString()}</span>
                            </div>
                            <div className="metric">
                              <span className="metric-label">Monthly Cash Flow</span>
                              <span className={`metric-value ${metrics.monthlyCashFlow >= 0 ? 'positive' : 'negative'}`}>
                                RM {metrics.monthlyCashFlow.toLocaleString()}
                              </span>
                            </div>
                            <div className="metric">
                              <span className="metric-label">Gross Yield</span>
                              <span className="metric-value">{metrics.grossYield.toFixed(2)}%</span>
                            </div>
                            <div className="metric">
                              <span className="metric-label">Cash-on-Cash Return</span>
                              <span className={`metric-value ${metrics.cashOnCashReturn >= 0 ? 'positive' : 'negative'}`}>
                                {metrics.cashOnCashReturn.toFixed(2)}%
                              </span>
                            </div>
                            <div className="metric">
                              <span className="metric-label">10-Year Total Return</span>
                              <span className="metric-value">{metrics.totalReturn.toFixed(1)}%</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => {
                              setSelectedProperty(property);
                              setMapCenter({lat: property.lat, lng: property.lng});
                              setZoom(16);
                              setShowAnalytics(false);
                            }}
                            className="view-property-btn"
                          >
                            View Property
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeAnalyticsTab === 'neighborhood' && (
              <div className="neighborhood-analysis">
                <h3>Neighborhood Comparison</h3>
                <div className="neighborhood-cards">
                  {neighborhoodData.map(district => (
                    <div key={district.name} className="neighborhood-card">
                      <div className="neighborhood-header">
                        <h4>{district.name}</h4>
                        <div className="overall-score">
                          <span className="score-value">{district.overallScore}</span>
                          <span className="score-label">/100</span>
                        </div>
                      </div>
                      
                      <div className="score-breakdown">
                        <div className="score-item">
                          <span>🛡️ Safety</span>
                          <div className="score-bar">
                            <div className="score-fill" style={{ width: `${district.safetyScore}%`, backgroundColor: '#4CAF50' }}></div>
                            <span className="score-text">{district.safetyScore}</span>
                          </div>
                        </div>
                        <div className="score-item">
                          <span>🎓 Schools</span>
                          <div className="score-bar">
                            <div className="score-fill" style={{ width: `${district.schoolScore}%`, backgroundColor: '#2196F3' }}></div>
                            <span className="score-text">{district.schoolScore}</span>
                          </div>
                        </div>
                        <div className="score-item">
                          <span>🚇 Transport</span>
                          <div className="score-bar">
                            <div className="score-fill" style={{ width: `${district.transportScore}%`, backgroundColor: '#FF9800' }}></div>
                            <span className="score-text">{district.transportScore}</span>
                          </div>
                        </div>
                        <div className="score-item">
                          <span>🏪 Amenities</span>
                          <div className="score-bar">
                            <div className="score-fill" style={{ width: `${district.amenitiesScore}%`, backgroundColor: '#9C27B0' }}></div>
                            <span className="score-text">{district.amenitiesScore}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="neighborhood-stats">
                        <div className="stat">
                          <span className="stat-label">Avg Price</span>
                          <span className="stat-value">RM {(district.averagePrice / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Growth</span>
                          <span className="stat-value positive">+{district.priceGrowth.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAnalyticsTab === 'recommendations' && (
              <div className="recommendations-analysis">
                <h3>🎯 Property Recommendations Based on Your Preferences</h3>
                <div className="recommendation-explanation">
                  <p>These recommendations are based on your search criteria, preferred features, and investment potential:</p>
                </div>
                
                <div className="recommendations-list">
                  {getPropertyRecommendations.map((property, index) => {
                    const neighborhoodScore = calculateNeighborhoodScore(property);
                    const metrics = calculateInvestmentMetrics(property);
                    
                    return (
                      <div key={property.id} className="recommendation-card">
                        <div className="recommendation-rank">#{index + 1}</div>
                        
                        <div className="recommendation-content">
                          <div className="recommendation-header">
                            <h4>{property.title}</h4>
                            <div className="recommendation-score">
                              <span className="score-value">{property.recommendationScore}</span>
                              <span className="score-label">/100</span>
                            </div>
                          </div>
                          
                          <div className="recommendation-details">
                            <div className="detail-row">
                              <span>💰 Price:</span>
                              <span>RM {property.price.toLocaleString()}</span>
                            </div>
                            <div className="detail-row">
                              <span>📐 Size:</span>
                              <span>{property.size} sqft</span>
                            </div>
                            <div className="detail-row">
                              <span>🏷️ Type:</span>
                              <span>{property.propertyType}</span>
                            </div>
                            <div className="detail-row">
                              <span>📍 District:</span>
                              <span>{property.schoolDistrict}</span>
                            </div>
                            <div className="detail-row">
                              <span>🚶 Walk Score:</span>
                              <span style={{ color: getWalkScoreColor(property.walkScore) }}>{property.walkScore}/100</span>
                            </div>
                            <div className="detail-row">
                              <span>🏘️ Neighborhood:</span>
                              <span>{neighborhoodScore}/100</span>
                            </div>
                            <div className="detail-row">
                              <span>💹 Gross Yield:</span>
                              <span className={metrics.grossYield >= 5 ? 'positive' : ''}>{metrics.grossYield.toFixed(2)}%</span>
                            </div>
                            <div className="detail-row">
                              <span>⭐ Investment Grade:</span>
                              <span className="investment-grade-small" style={{ background: getGradeColor(property.investmentGrade) }}>
                                {property.investmentGrade}
                              </span>
                            </div>
                          </div>
                          
                          <div className="recommendation-features">
                            <strong>Features:</strong>
                            <div className="features-list">
                              {property.features?.map(feature => (
                                <span key={feature} className="feature-tag">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="recommendation-actions">
                            <button 
                              onClick={() => {
                                setSelectedProperty(property);
                                setMapCenter({lat: property.lat, lng: property.lng});
                                setZoom(16);
                                setShowAnalytics(false);
                              }}
                              className="primary-btn"
                            >
                              📍 View on Map
                            </button>
                            <button 
                              onClick={() => saveProperty(property)}
                              className={`save-btn ${isPropertySaved(property.id) ? 'saved' : ''}`}
                            >
                              {isPropertySaved(property.id) ? '❤️ Saved' : '🤍 Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
    .delete-btn { background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; margin-left: 8px; }
    .close-btn { background: #f44336; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; }
    
    /* Analytics Modal Styles */
    .analytics-modal { 
      background: #1f2328; 
      width: 95vw; 
      height: 90vh; 
      border-radius: 12px; 
      display: flex; 
      flex-direction: column; 
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .analytics-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 20px 25px; 
      border-bottom: 1px solid #444; 
      background: #2c3038;
    }
    .analytics-header h2 { margin: 0; color: #fff; fontsize: 24px; }
    .analytics-tabs { 
      display: flex; 
      background: #2c3038; 
      border-bottom: 1px solid #444; 
      overflow-x: auto;
    }
    .tab-btn { 
      background: transparent; 
      color: #aaa; 
      border: none; 
      padding: 15px 20px; 
      cursor: pointer; 
      transition: all 0.2s; 
      white-space: nowrap;
      font-size: 14px;
      font-weight: 500;
    }
    .tab-btn:hover { color: #fff; background: #404652; }
    .tab-btn.active { color: #00aaff; background: #1f2328; border-bottom: 2px solid #00aaff; }
    .analytics-content { 
      flex: 1; 
      padding: 25px; 
      overflow-y: auto; 
      background: #1f2328;
    }
    .analytics-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); 
      gap: 20px; 
    }
    .chart-container { 
      background: #2c3038; 
      padding: 20px; 
      border-radius: 8px; 
      border: 1px solid #444;
    }
    .chart-container h3 { 
      margin: 0 0 15px 0; 
      color: #fff; 
      font-size: 16px;
      font-weight: 600;
    }
    
    /* Investment Analysis Styles */
    .investment-analysis { display: flex; flex-direction: column; gap: 25px; }
    .investment-params { background: #2c3038; padding: 20px; border-radius: 8px; border: 1px solid #444; }
    .investment-params h3 { margin: 0 0 15px 0; color: #fff; }
    .params-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .params-grid label { display: block; font-size: 14px; color: #aaa; margin-bottom: 5px; }
    .param-input { width: 100%; background: #1f2328; color: #e0e0e0; border: 1px solid #444; border-radius: 4px; padding: 8px; }
    .investment-results h3 { color: #fff; margin-bottom: 15px; }
    .investment-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
    .investment-card { background: #2c3038; padding: 20px; border-radius: 8px; border: 1px solid #444; }
    .investment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .investment-header h4 { margin: 0; color: #fff; }
    .investment-grade { color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
    .investment-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
    .metric { display: flex; justify-content: space-between; padding: 8px; background: #1f2328; border-radius: 4px; }
    .metric-label { color: #aaa; font-size: 12px; }
    .metric-value { color: #fff; font-weight: bold; font-size: 12px; }
    .metric-value.positive { color: #4CAF50; }
    .metric-value.negative { color: #f44336; }
    .view-property-btn { width: 100%; background: #00aaff; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; }
    
    /* Neighborhood Analysis Styles */
    .neighborhood-analysis h3 { color: #fff; margin-bottom: 20px; }
    .neighborhood-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .neighborhood-card { background: #2c3038; padding: 20px; border-radius: 8px; border: 1px solid #444; }
    .neighborhood-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .neighborhood-header h4 { margin: 0; color: #fff; }
    .overall-score { text-align: center; }
    .score-value { font-size: 24px; font-weight: bold; color: #00aaff; }
    .score-label { font-size: 14px; color: #aaa; }
    .score-breakdown { margin-bottom: 15px; }
    .score-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .score-item span:first-child { color: #e0e0e0; font-size: 14px; min-width: 100px; }
    .score-bar { flex: 1; height: 20px; background: #1f2328; border-radius: 10px; margin: 0 10px; position: relative; overflow: hidden; }
    .score-fill { height: 100%; border-radius: 10px; transition: width 0.3s ease; }
    .score-text { position: absolute; right: 5px; top: 50%; transform: translateY(-50%); color: #fff; font-size: 12px; font-weight: bold; }
    .neighborhood-stats { display: flex; justify-content: space-between; padding-top: 15px; border-top: 1px solid #444; }
    .stat { text-align: center; }
    .stat-label { display: block; color: #aaa; font-size: 12px; }
    .stat-value { color: #fff; font-weight: bold; }
    .stat-value.positive { color: #4CAF50; }
    
    /* Recommendations Styles */
    .recommendations-analysis h3 { color: #fff; margin-bottom: 15px; }
    .recommendation-explanation { background: #2c3038; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #444; }
    .recommendation-explanation p { margin: 0; color: #aaa; font-size: 14px; }
    .recommendations-list { display: flex; flex-direction: column; gap: 15px; }
    .recommendation-card { background: #2c3038; padding: 20px; border-radius: 8px; border: 1px solid #444; display: flex; gap: 15px; }
    .recommendation-rank { 
      background: linear-gradient(135deg, #00aaff, #0095e0); 
      color: white; 
      width: 40px; 
      height: 40px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-weight: bold; 
      font-size: 16px;
      flex-shrink: 0;
    }
    .recommendation-content { flex: 1; }
    .recommendation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .recommendation-header h4 { margin: 0; color: #fff; }
    .recommendation-score { text-align: center; }
    .recommendation-details { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px; background: #1f2328; border-radius: 4px; }
    .detail-row span:first-child { color: #aaa; font-size: 13px; }
    .detail-row span:last-child { color: #fff; font-weight: 500; font-size: 13px; }
    .detail-row .positive { color: #4CAF50; }
    .investment-grade-small { padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: bold; color: white; }
    .recommendation-features { margin-bottom: 15px; }
    .recommendation-features strong { color: #fff; font-size: 13px; }
    .features-list { margin-top: 5px; display: flex; flex-wrap: wrap; gap: 5px; }
    .feature-tag { background: #404652; color: #e0e0e0; padding: 2px 6px; border-radius: 3px; font-size: 11px; }
    .recommendation-actions { display: flex; gap: 10px; }
    .recommendation-actions .primary-btn, .recommendation-actions .save-btn { 
      flex: 1; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      gap: 5px; 
      padding: 8px 12px; 
      font-size: 12px;
    }
  `;

  if (loadError) return <div style={{color: 'white', padding: '20px'}}>Error loading maps</div>;
  if (!isLoaded) return <div style={{color: 'white', padding: '20px'}}>Loading Maps...</div>;

  return (
    <div style={{ display: 'flex', background: '#1f2328' }}>
      <style>{css}</style>
      
      {/* Analytics Modal */}
      <AnalyticsModal />
      
      {/* Sidebar */}
      <div className="sidebar-container" style={{ width: 400, height: '100vh', overflowY: 'auto', background: '#1f2328', padding: '20px', fontFamily: "'Inter', sans-serif" }}>
        
        <div style={{ marginBottom: '25px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff', margin: 0 }}>GeoHome Pro</h1>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>Enhanced Real Estate & Market Analysis</p>
        </div>
        
        {/* Analytics Dashboard Button */}
        <button 
          onClick={() => setShowAnalytics(true)}
          className="primary-btn"
          style={{ marginBottom: '20px' }}
        >
          {icons.analytics} Analytics Dashboard
        </button>
        
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
            <NumberInput
              value={propertyFilters.minPrice}
              onChange={(value) => handleFilterChange('minPrice', value)}
              placeholder="Min Price"
              className="input-field"
            />
            <NumberInput
              value={propertyFilters.maxPrice}
              onChange={(value) => handleFilterChange('maxPrice', value)}
              placeholder="Max Price"
              className="input-field"
            />
          </div>

          <label className="label-text">Size (sqft)</label>
          <div className="filter-grid">
            <NumberInput
              value={propertyFilters.minSize}
              onChange={(value) => handleFilterChange('minSize', value)}
              placeholder="Min Size"
              className="input-field"
            />
            <NumberInput
              value={propertyFilters.maxSize}
              onChange={(value) => handleFilterChange('maxSize', value)}
              placeholder="Max Size"
              className="input-field"
            />
          </div>

          <label className="label-text">Lot Size (sqft)</label>
          <div className="filter-grid">
            <NumberInput
              value={propertyFilters.minLotSize}
              onChange={(value) => handleFilterChange('minLotSize', value)}
              placeholder="Min Lot Size"
              className="input-field"
            />
            <NumberInput
              value={propertyFilters.maxLotSize}
              onChange={(value) => handleFilterChange('maxLotSize', value)}
              placeholder="Max Lot Size"
              className="input-field"
            />
          </div>

          <label className="label-text">Year Built</label>
          <div className="filter-grid">
            <input
              type="text"
              value={propertyFilters.minYearBuilt}
              onChange={e => handleYearChange('minYearBuilt', e.target.value)}
              placeholder="Min Year (e.g., 2000)"
              className="input-field"
              maxLength="4"
              autoComplete="off"
            />
            <input
              type="text"
              value={propertyFilters.maxYearBuilt}
              onChange={e => handleYearChange('maxYearBuilt', e.target.value)}
              placeholder="Max Year (e.g., 2024)"
              className="input-field"
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
          
          <div style={{ marginTop: '15px', padding: '10px', background: '#1f2328', borderRadius: '6px' }}>
            <div style={{ fontSize: '14px', color: '#00aaff', fontWeight: 'bold' }}>
              {filteredProperties.length} properties match your criteria
            </div>
          </div>
        </Section>

        {/* Property Recommendations */}
        <Section title="🎯 AI Recommendations" icon={icons.recommendation}>
          <div style={{ marginBottom: '15px' }}>
            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 10px 0' }}>
              Based on your search preferences and market analysis
            </p>
          </div>
          
          {getPropertyRecommendations.slice(0, 3).map((property, index) => (
            <div key={property.id} style={{ 
              background: '#1f2328', 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '10px',
              border: '1px solid #333'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ 
                  background: '#00aaff', 
                  color: 'white', 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '12px', 
                  fontWeight: 'bold' 
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#fff', fontSize: '14px' }}>{property.title}</strong>
                  <div style={{ 
                    background: getGradeColor(property.investmentGrade), 
                    color: 'white', 
                    padding: '2px 6px', 
                    borderRadius: '3px', 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    display: 'inline-block',
                    marginLeft: '8px'
                  }}>
                    {property.investmentGrade}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#00aaff', fontWeight: 'bold', fontSize: '12px' }}>
                    {property.recommendationScore}/100
                  </div>
                  <div style={{ color: '#888', fontSize: '10px' }}>Match Score</div>
                </div>
              </div>
              
              <div className="property-price" style={{ marginBottom: '5px' }}>
                RM {property.price.toLocaleString()}
              </div>
              
              <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>
                {property.size} sqft • {property.propertyType} • {property.schoolDistrict}
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
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
                    fontSize: '11px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  📍 View
                </button>
                <button
                  onClick={() => saveProperty(property)}
                  className={`save-btn ${isPropertySaved(property.id) ? 'saved' : ''}`}
                  style={{ flex: 1, fontSize: '11px' }}
                >
                  {isPropertySaved(property.id) ? '❤️ Saved' : '🤍 Save'}
                </button>
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => {
              setShowAnalytics(true);
              setActiveAnalyticsTab('recommendations');
            }}
            className="secondary-btn"
            style={{ marginTop: '10px' }}
          >
            View All Recommendations
          </button>
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
              <div style={{ maxWidth: 350, background: 'white', padding: '20px', borderRadius: '8px', color: '#333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0, color: '#333' }}>{selectedProperty.title}</h4>
                  <div style={{ 
                    background: getGradeColor(selectedProperty.investmentGrade), 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    fontWeight: 'bold' 
                  }}>
                    {selectedProperty.investmentGrade}
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
                  <div>
                    <strong>Price:</strong><br/>
                    <span style={{ color: '#00aaff', fontSize: '18px', fontWeight: 'bold' }}>
                      RM {selectedProperty.price.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <strong>Monthly Rent:</strong><br/>
                    <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                      RM {selectedProperty.monthlyRent.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <strong>Size:</strong><br/>
                    {selectedProperty.size} sqft
                  </div>
                  <div>
                    <strong>Built:</strong><br/>
                    {selectedProperty.yearBuilt}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>Type:</strong> {selectedProperty.propertyType}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>District:</strong> {selectedProperty.schoolDistrict}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>Days on Market:</strong> {selectedProperty.daysOnMarket} days
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Price/sqft:</strong> RM {selectedProperty.pricePerSqft}
                  </div>
                </div>

                {/* Analytics Summary */}
                <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                    <div>
                      <strong>Gross Yield:</strong><br/>
                      <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                        {((selectedProperty.monthlyRent * 12) / selectedProperty.price * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div>
                      <strong>Neighborhood Score:</strong><br/>
                      <span style={{ fontWeight: 'bold' }}>
                        {calculateNeighborhoodScore(selectedProperty)}/100
                      </span>
                    </div>
                    <div>
                      <strong>Walk Score:</strong><br/>
                      <span style={{ color: getWalkScoreColor(selectedProperty.walkScore), fontWeight: 'bold' }}>
                        {selectedProperty.walkScore}/100
                      </span>
                    </div>
                    <div>
                      <strong>Appreciation:</strong><br/>
                      <span style={{ color: selectedProperty.appreciation >= 0 ? '#4CAF50' : '#f44336', fontWeight: 'bold' }}>
                        {selectedProperty.appreciation >= 0 ? '+' : ''}{selectedProperty.appreciation.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Walk Score Display */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <strong>Walkability:</strong>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {getWalkScoreLabel(selectedProperty.walkScore)}
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
                </div>

                {/* Features */}
                {selectedProperty.features && selectedProperty.features.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Features:</strong><br/>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                      {selectedProperty.features.map(feature => (
                        <span key={feature} style={{ 
                          background: '#e3f2fd', 
                          color: '#1976d2', 
                          padding: '3px 8px', 
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

                <p style={{ fontSize: '14px', margin: '15px 0', color: '#666' }}>{selectedProperty.description}</p>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveProperty(selectedProperty);
                    }}
                    style={{ 
                      flex: 1,
                      padding: '10px',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                      background: isPropertySaved(selectedProperty.id) ? '#FF6B6B' : '#4ECDC4',
                      color: 'white'
                    }}
                  >
                    {isPropertySaved(selectedProperty.id) ? '❤️ Saved' : '🤍 Save'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowAnalytics(true);
                      setActiveAnalyticsTab('investment');
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #00aaff',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      background: 'white',
                      color: '#00aaff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    📊 Analytics
                  </button>
                </div>
                
                {selectedProperty.imageUrl && (
                  <img 
                    src={selectedProperty.imageUrl} 
                    alt={selectedProperty.title} 
                    style={{ width: "100%", borderRadius: '6px', marginTop: '10px' }} 
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
