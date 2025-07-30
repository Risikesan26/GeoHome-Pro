# 🏠 GeoHome Pro

**Enhanced Real Estate & Market Analysis Platform**

GeoHome Pro is a comprehensive real estate analysis tool that combines property search, market analytics, investment calculations, and neighborhood insights into one powerful platform. Built with React and Google Maps API, it provides users with data-driven insights for property investment decisions.

> **⚠️ Important Notice**: All property data, prices, market trends, and analytics shown in this application are **mock data for demonstration purposes only**. This is a proof-of-concept application designed to showcase real estate analysis features. Do not use this data for actual investment decisions. For real estate investments, always consult with licensed professionals and use verified market data.

![GeoHome Pro Screenshot](https://via.placeholder.com/800x400/1f2328/ffffff?text=GeoHome+Pro+Dashboard)

## ✨ Features

### 🔍 **Smart Property Search**
- **Location-based Search**: Search any location in Malaysia using Google Places API
- **Advanced Filtering**: Filter by price, size, property type, year built, and features
- **Real-time Results**: Instantly see filtered properties on the interactive map

### 📊 **Analytics Dashboard**
- **Market Trends**: Visualize price trends, inventory levels, and sales volume
- **Investment Analysis**: Calculate ROI, cash flow, and investment metrics
- **Neighborhood Scoring**: Compare safety, schools, transport, and amenities
- **Property Distribution**: Analyze property types and price ranges

### 🎯 **AI-Powered Recommendations**
- **Smart Matching**: Get personalized property recommendations based on your criteria
- **Investment Grading**: Properties rated from A+ to B- based on investment potential
- **Score-based Ranking**: Properties ranked by compatibility with your preferences

### 🗺️ **Interactive Mapping**
- **Google Maps Integration**: Full-featured mapping with custom styling
- **Property Markers**: Visual distinction between regular and saved properties
- **Market Overlays**: Color-coded areas showing price appreciation trends
- **Nearby Places**: Find schools, restaurants, hospitals, and parks
- **Route Planning**: Get directions with multiple transport modes

### 💰 **Investment Tools**
- **Cash Flow Calculator**: Analyze monthly cash flow and expenses
- **ROI Metrics**: Calculate gross yield, net yield, and cash-on-cash returns
- **Future Projections**: 10-year investment return projections
- **Comparative Analysis**: Compare multiple properties side-by-side

### 💖 **Property Management**
- **Save Properties**: Bookmark properties for later review
- **Property History**: Track when properties were saved
- **Quick Access**: Easy viewing and management of saved properties

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Maps API Key with the following APIs enabled:
  - Maps JavaScript API
  - Places API
  - Directions API
  - Distance Matrix API

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/geohome-pro.git
   cd geohome-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Google Maps API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Distance Matrix API (optional)
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Add the API key to your `.env` file

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_GOOGLE_MAPS_API_KEY` | Your Google Maps API key | Yes |

## 📁 Project Structure

```
geohome-pro/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   └── GeoHomePro.js      # Main component
│   ├── utils/
│   │   ├── mockData.js        # Mock property data generators
│   │   └── calculations.js    # Investment calculation utilities
│   ├── styles/
│   │   └── globals.css        # Global styles
│   ├── App.js
│   └── index.js
├── .env.example
├── package.json
└── README.md
```

## 🛠️ Built With

### Core Technologies
- **React** (18+) - Frontend framework
- **Google Maps API** - Mapping and location services
- **Recharts** - Data visualization and charts

### Key Dependencies
- `@react-google-maps/api` - Google Maps React integration
- `recharts` - Chart library for analytics
- `react-hooks` - State management

### Styling
- **CSS-in-JS** - Component-level styling
- **CSS Grid & Flexbox** - Modern layout techniques
- **Dark Theme** - Professional dark UI design

## 📊 Data & Disclaimer

### Mock Data Sources
This application currently uses **algorithmically generated mock data** to demonstrate functionality:

- **Property Listings**: Randomly generated properties with realistic Malaysian market characteristics
- **Market Trends**: Simulated price movements and market analytics
- **Investment Metrics**: Calculated using mock rental yields and appreciation rates
- **Neighborhood Scores**: Simulated safety, school, and amenity ratings
- **Nearby Places**: Real data from Google Places API

### Data Accuracy Notice
> **🚨 Critical Disclaimer**: All property prices, market analytics, investment calculations, and recommendations are based on simulated data and should **NOT** be used for actual real estate investment decisions. This application is designed for:
> - **Portfolio demonstration**
> - **Feature showcase**
> - **Technical proof-of-concept**
> - **Educational purposes**

### For Production Use
To use this application with real data, you would need to:
- Integrate with actual property listing APIs (e.g., PropertyGuru, iProperty, EdgeProp)
- Connect to real market data providers
- Implement verified property valuation services
- Add proper data validation and verification systems

## 📊 Analytics Features

### Market Analytics
- **Price Trends**: 12-month historical price data
- **Property Distribution**: Pie charts showing property types
- **Price Ranges**: Bar charts for price range analysis
- **Market Metrics**: Inventory and sales volume trends

### Investment Analysis
- **Customizable Parameters**: Down payment, loan terms, interest rates
- **Cash Flow Calculations**: Monthly income vs. expenses
- **ROI Metrics**: Multiple return calculations
- **Risk Assessment**: Investment grade scoring

### Neighborhood Analysis
- **Scoring System**: Safety, schools, transport, amenities
- **Comparative View**: Side-by-side neighborhood comparison
- **Growth Metrics**: Price appreciation tracking

## 🎯 Usage Examples

### Basic Property Search
```javascript
// Search for properties in Kuala Lumpur
1. Enter "Kuala Lumpur" in the search box
2. Adjust filters (price range, property type, etc.)
3. View results on the map
4. Click markers for detailed property information
```

### Investment Analysis
```javascript
// Analyze investment potential
1. Search for a location
2. Open Analytics Dashboard
3. Go to Investment Analysis tab
4. Adjust investment parameters
5. Review ROI calculations and recommendations
```

### Saving Properties
```javascript
// Save properties for later review
1. Click on a property marker
2. Click the "Save" button in the info window
3. View saved properties in the sidebar
4. Manage saved properties list
```

## 🚦 Development

### Running Tests
```bash
npm test
# or
yarn test
```

### Building for Production
```bash
npm run build
# or
yarn build
```

### Code Style
This project follows:
- **ESLint** for code linting
- **Prettier** for code formatting
- **React best practices** for component structure

## 🔮 Future Enhancements

### Planned Features
- [ ] **Real Property Data Integration** - Connect to actual MLS/property APIs (PropertyGuru, iProperty, EdgeProp)
- [ ] **Verified Market Data** - Integration with official property transaction records
- [ ] **Real-time Pricing** - Live market data feeds and price updates
- [ ] **User Authentication** - Save preferences and properties to user accounts
- [ ] **Market Alerts** - Email notifications for price changes and new listings
- [ ] **3D Property Views** - Virtual property tours
- [ ] **Mortgage Calculator** - Detailed loan calculations with real bank rates
- [ ] **Comparative Market Analysis** - Advanced property comparisons with verified data
- [ ] **Export Reports** - PDF generation for property and market reports
- [ ] **Mobile App** - React Native mobile application
- [ ] **Professional Dashboard** - Tools for real estate agents and analysts

### Technical Improvements
- [ ] **TypeScript Migration** - Add type safety
- [ ] **Unit Testing** - Comprehensive test coverage
- [ ] **Performance Optimization** - Code splitting and lazy loading
- [ ] **PWA Features** - Offline functionality
- [ ] **Real-time Data** - WebSocket integration for live updates

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Contribution Guidelines
- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Test your changes thoroughly

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- Website: (https://risikesan26.github.io/Risikesan-s-Portfolio/)
- LinkedIn: (www.linkedin.com/in/risikesan26)
- Email: your.email@example.com

## 🙏 Acknowledgments

- **Google Maps Platform** - For comprehensive mapping services
- **Recharts Team** - For excellent data visualization components
- **React Community** - For the amazing ecosystem and support
- **Open Source Contributors** - For inspiration and code examples

## 📞 Support

If you have any questions or need help, please:

1. **Check the documentation** above
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information
4. **Contact the maintainer** via email

---

**⭐ If you found this project helpful, please give it a star on GitHub!**

---

*Made with ❤️ for the real estate community*
