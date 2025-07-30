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

export default function MapLandingPage({ username }) {
    const [searchText, setSearchText] = useState("");
    const [center, setCenter] = useState([40.7128, -74.006]); //NYC
    const [searchResultName, setSearchResultName] = useState("");
    const [searchInfo, setSearchInfo] = useState(null);

    const handleSave = async () => {
        console.log("Inside handleSave")
        console.log("SearchInfo: " + JSON.stringify(searchInfo))
        console.log("username: " + username)
        if(!searchInfo || !username){
            console.log("Failed to save, missing user info or other relevant data") 
            return 
        }//If the user hasn't signed in

        const params = {
            "username": username,
            "sitename": searchInfo.sitename,
            "stateid": searchInfo.stateid,
            "countyid": searchInfo.countyid,
            "latitude": searchInfo.lat,
            "longitude": searchInfo.lon,
            "rp_elevation": searchInfo.elevation,
            "unit": searchInfo.unit,
            "gageheight": searchInfo.gageheight,
            "isflooding": searchInfo.isflooding,
            "active": searchInfo.active
        }

        try{
            const response = await fetch("http://localhost:8000/db/userdata",{
                method: "POST",
                headers:{ "Content-Type": "application/json" },
                body: JSON.stringify(params)
            })

            const result = await response.json()

            if(response.ok) console.log("Successfully Saved")
            else console.log("Error occurred while saving data: " + result.messaage)
        }
        catch(error){ console.log("Error occurred while saving: " + error) }
    }

    const handleSearch = async () => {
        const query = encodeURIComponent(searchText);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;

        try{
            const response = await fetch(url);
            const data = await response.json();

            if(data && data.length > 0){
                const firstResult = data[0];
                const lat = parseFloat(firstResult.lat);
                const lon = parseFloat(firstResult.lon);

                const referenceReq = await fetch("http://localhost:8000/db/nearestReferencePoint",{
                    method: "POST",
                    headers:{ "Content-Type": "application/json" },
                    body: JSON.stringify({
                        "lat": lat,
                        "lon": lon
                    })
                })

                const referenceData = await referenceReq.json()

                setCenter([lat, lon]);
                setSearchInfo({ 
                    lat,
                    lon,
                    stateid: referenceData.properties?.stateid,
                    countyid: referenceData.properties?.countyid || null,
                    sitelat: referenceData.geometry?.coordinates?.[1],
                    sitelon: referenceData.geometry?.coordinates?.[0],
                    sitename: referenceData.properties?.sitename || "Unknown",
                    elevation: referenceData.properties?.rp_elevation || null,
                    gageheight: referenceData.properties?.gageheight || null,
                    unit: referenceData.properties?.unit,
                    isflooding: referenceData.properties?.isflooding || null,
                    active: referenceData.properties?.active
                });
                setSearchResultName(firstResult.display_name);
            } else {
                alert("Address not found.");
            }
        } catch (error) {
            alert("Error fetching location.");
        }
    };

    //Containers
    return (
        <div className="landing-page">
            <header className="header">
                <h1>FloodWatch</h1>
                <p>Stay Alert. Stay Safe.</p>
                <div style={{marginTop: "1rem"}}>
                    <input
                    type="text"
                    placeholder="Enter address here"
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

            {searchResultName && searchInfo && ( //Ensure box only appears where there is a result
                <div className="search-info-box">
                    <strong>Search Result:</strong>
                    <p>{searchResultName}</p>
                    <p><strong>Latitude:</strong> {searchInfo.lat}</p>
                    <p><strong>Longitude:</strong> {searchInfo.lon}</p>
                    <p><strong>Nearest gage site:</strong> {searchInfo.sitename}</p>
                    <p><strong>Site Coordinates:</strong> {searchInfo.sitelat}, {searchInfo.sitelon}</p>
                    <p><strong>Elevation:</strong> {searchInfo.elevation} {searchInfo.unit}</p>
                    <p><strong>Gage height:</strong> {searchInfo.gageheight} {searchInfo.unit}</p>
                    <p><strong>Is it flooding:</strong> {searchInfo.isflooding ? 'Yes':'No'}</p>
                    <button
                    onClick={handleSave}
                    style={{
                        marginLeft: "0.5rem",
                        padding: "0.5rem 1rem",
                        cursor: "pointer",
                    }}
                    >Save
                    </button>
                </div>
            )}

            <footer className="footer">
                &copy; {new Date().getFullYear()} FloodWatch
            </footer>
        </div>
    );
}