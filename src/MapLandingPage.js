import React, { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapLandingPage.css";

const redSquareIcon = L.divIcon({
    className: "custom-marker",
    iconSize: [20, 20]
});

function FlyToLocation({ coords }){
    const map = useMap();
    if(coords){
        map.flyTo(coords, 13) //13 is arbitrary zoom level
    }

    return null;
}

export default function MapLandingPage() {
    const [searchText, setSearchText] = useState("");
    const [center, setCenter] = useState([40.7128, -74.006]); //NYC

    const handleSearch = async () => {
        const query = encodeURIComponent(searchText);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;

        try{
            const response = await fetch(url);
            const data = await response.json();

            if(data && data.length > 0){
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                setCenter([lat, lon]);
            } else {
                alert("Address not found.");
            }
        } catch (error) {
            alert("Error fetching location.");
        }
    };

    return (
        <div className="landing-page">
            <header className="header">
                <h1>FloodWatch</h1>
                <p>Stay Alert. Stay Safe.</p>
                <div style={{marginTop: "1rem"}}>
                    <input
                    type="text"
                    placeholder="Enter address..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{padding: "0.5rem", width: "300px"}}
                    />
                    <button
                    onClick={handleSearch}
                    style={{
                        marginLeft: "0.5rem",
                        padding: "0.5rem 1rem",
                        cursor: "pointer",
                    }}
                    >Search
                    </button>
                </div>
            </header>

            <div className="map-container">
                <MapContainer
                    center={center}
                    zoom={13}
                    style={{height: "100%", width: "100%"}}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://osm.org/copyright">OpenStreeMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FlyToLocation coords={center} />
                    <Marker position={center} icon={redSquareIcon}>
                        <Popup>Search result location</Popup>
                    </Marker>
                </MapContainer>
            </div>
            <footer className="footer">
                &copy; {new Date().getFullYear()} FloodWatch
            </footer>
        </div>
    );
}