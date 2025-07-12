
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface CountryData {
  country: string;
  sales: number;
  percentage: number;
  coordinates?: [number, number];
}

interface WorldMapProps {
  data: CountryData[];
}

// Country coordinates for the top countries
const countryCoordinates: Record<string, [number, number]> = {
  "United States": [-95.7129, 37.0902],
  "United Kingdom": [-0.1278, 51.5074],
  "Germany": [10.4515, 51.1657],
  "France": [2.2137, 46.2276],
  "Canada": [-106.3468, 56.1304],
  "Australia": [133.7751, -25.2744],
  "Japan": [138.2529, 36.2048],
};

// This component will render if a Mapbox token is not provided
const MapPlaceholder = () => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center text-muted-foreground">
      <p className="mb-2">Map visualization needs a Mapbox token</p>
      <p className="text-sm">Please provide a valid Mapbox token to see the geographic distribution</p>
    </div>
  </div>
);

const WorldMap: React.FC<WorldMapProps> = ({ data }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Function to initialize the map with the provided token
  const initializeMap = (token: string) => {
    if (!mapContainer.current) return;
    
    try {
      mapboxgl.accessToken = token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        projection: 'globe',
        zoom: 1.5,
        center: [0, 20],
        pitch: 30,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Set up rotation animation
      const secondsPerRevolution = 240;
      const maxSpinZoom = 5;
      let spinning = true;
      let lastTime = 0;

      function spinGlobe(time: number) {
        if (!map.current || !spinning) return;
        
        const zoom = map.current.getZoom();
        if (spinning && zoom < maxSpinZoom) {
          const deltaTime = time - lastTime;
          const center = map.current.getCenter();
          center.lng -= (deltaTime / 1000) * (360 / secondsPerRevolution);
          map.current.easeTo({ center, duration: 0 });
        }
        lastTime = time;
        window.requestAnimationFrame(spinGlobe);
      }

      map.current.on('load', () => {
        // Add atmosphere and fog effects
        map.current?.setFog({
          color: 'rgb(255, 255, 255)',
          'high-color': 'rgb(200, 200, 225)',
          'horizon-blend': 0.2,
        });
        
        // Add markers for each country in our data
        data.forEach((country) => {
          if (country.country === "Other") return;
          
          const coordinates = countryCoordinates[country.country];
          if (!coordinates) return;
          
          // Create marker element
          const el = document.createElement('div');
          el.className = 'country-marker';
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.background = 'rgba(56, 189, 248, 0.8)';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
          el.style.cursor = 'pointer';
          
          // Scale marker based on percentage
          const size = Math.max(20, Math.min(40, country.percentage * 1.5));
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
          
          // Add popup
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <strong>${country.country}</strong>
                <div>Sales: ${country.sales.toLocaleString()}</div>
                <div>Market Share: ${country.percentage}%</div>
              </div>
            `);
          
          // Add marker to map
          new mapboxgl.Marker(el)
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map.current!);
        });

        // Start the animation
        window.requestAnimationFrame(spinGlobe);
      });

      // Stop spinning on user interaction
      map.current.on('mousedown', () => {
        spinning = false;
      });
      
      map.current.on('touchstart', () => {
        spinning = false;
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setShowTokenInput(true);
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken) {
      localStorage.setItem('mapbox_token', mapboxToken);
      initializeMap(mapboxToken);
      setShowTokenInput(false);
    }
  };

  useEffect(() => {
    // Try to get token from localStorage
    const storedToken = localStorage.getItem('mapbox_token');
    if (storedToken) {
      setMapboxToken(storedToken);
      initializeMap(storedToken);
    } else {
      setShowTokenInput(true);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  if (showTokenInput) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-md p-4 rounded-md border">
          <h3 className="text-lg font-medium mb-2">Mapbox Token Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please enter your Mapbox public token to activate the map. 
            You can find it in your Mapbox account dashboard.
          </p>
          <form onSubmit={handleTokenSubmit} className="space-y-2">
            <input
              type="text"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              placeholder="Enter Mapbox token (pk.eyJ1...)"
              className="w-full p-2 border rounded-md"
            />
            <button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Activate Map
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
};

export default WorldMap;
