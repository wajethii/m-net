// maps.js - Contains all map-related functionality

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const addressForm = document.getElementById('address-form');
    const addressInput = document.getElementById('address');
    const suggestionsContainer = document.getElementById('address-suggestions');
    const checkBtn = document.getElementById('check-availability-btn');
    const btnText = document.getElementById('btn-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    const mapContainer = document.getElementById('map-container');
    const leadForm = document.getElementById('lead-form');
    const notCoveredMessage = document.getElementById('not-covered-message');
    
    let map, coverageLayer, currentMarker;
    let mapInitialized = false;

    // Address suggestions with debounce
    let debounceTimer;
    addressInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fetchAddressSuggestions, 300);
    });

    // Hide suggestions when clicking elsewhere
    document.addEventListener('click', function(e) {
        if (!addressInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.classList.add('hidden');
        }
    });

    // Form submission
    addressForm.addEventListener('submit', function(e) {
        e.preventDefault();
        checkAddressAvailability();
    });

    async function fetchAddressSuggestions() {
        const query = addressInput.value.trim();
        if (query.length < 3) {
            suggestionsContainer.classList.add('hidden');
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Thika, Kenya')}&limit=5`);
            const data = await response.json();
            
            suggestionsContainer.innerHTML = '';
            
            if (data.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'p-3 text-gray-500 text-sm';
                noResults.textContent = 'No suggestions found';
                suggestionsContainer.appendChild(noResults);
            } else {
                data.forEach(item => {
                    const suggestion = document.createElement('div');
                    suggestion.className = 'p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0 text-left text-sm';
                    suggestion.textContent = item.display_name;
                    suggestion.onclick = () => {
                        addressInput.value = item.display_name;
                        suggestionsContainer.classList.add('hidden');
                        checkAddressAvailability();
                    };
                    suggestionsContainer.appendChild(suggestion);
                });
            }
            
            suggestionsContainer.classList.remove('hidden');
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    }

    async function checkAddressAvailability() {
        const address = addressInput.value.trim();
        if (!address) {
            showAlert('Please enter an address', 'error');
            return;
        }

        // UI Loading state
        checkBtn.disabled = true;
        btnText.textContent = "Checking...";
        loadingSpinner.classList.remove('hidden');

        try {
            // Simulate API call (replace with actual API call)
            // In a real implementation, you would call your backend API
            // that checks against your coverage database
            const isCovered = await simulateCoverageCheck(address);

            // Hide previous elements
            leadForm.classList.add('hidden');
            notCoveredMessage.classList.add('hidden');
            mapContainer.classList.add('hidden');

            if (isCovered) {
                // Show success elements
                leadForm.classList.remove('hidden');
                initializeMap(address);
            } else {
                // Show not covered message
                notCoveredMessage.classList.remove('hidden');
            }
        } catch (error) {
            console.error("Error checking address:", error);
            showAlert('Error checking address. Please try again.', 'error');
        } finally {
            // Reset UI
            checkBtn.disabled = false;
            btnText.textContent = "Check Now";
            loadingSpinner.classList.add('hidden');
        }
    }

    async function simulateCoverageCheck(address) {
        // This is a simulation - replace with actual API call
        // For demo purposes, we'll randomly return true/false
        // In reality, you would check against your coverage database
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(Math.random() > 0.3); // 70% chance of being covered
            }, 1500);
        });
    }

    async function initializeMap(address) {
        if (!mapInitialized) {
            // Load Leaflet dynamically
            await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
            await loadScript('https://unpkg.com/leaflet-pip@1.1.0/leaflet-pip.js');
            
            // Initialize map
            map = L.map('map').setView([-1.039, 37.08], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

            // Add coverage areas (simplified for demo)
            coverageLayer = L.layerGroup().addTo(map);
            
            // Example coverage areas (replace with your actual areas)
            const coverageAreas = [
                L.polygon([ // Kiganjo
                    [-1.033, 37.070], [-1.033, 37.080], 
                    [-1.043, 37.080], [-1.043, 37.070]
                ], {color: 'blue', fillOpacity: 0.2}),
                
                L.polygon([ // Makongeni
                    [-1.040, 37.075], [-1.040, 37.085],
                    [-1.050, 37.085], [-1.050, 37.075]
                ], {color: 'blue', fillOpacity: 0.2}),
                
                L.polygon([ // Kisii Estate
                    [-1.036, 37.082], [-1.036, 37.092],
                    [-1.046, 37.092], [-1.046, 37.082]
                ], {color: 'blue', fillOpacity: 0.2})
            ];
            
            coverageAreas.forEach(area => {
                area.addTo(coverageLayer);
            });

            mapInitialized = true;
        }

        // Geocode address to show on map
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Thika, Kenya')}&limit=1`);
            const data = await response.json();
            
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                
                // Remove previous marker
                if (currentMarker) {
                    map.removeLayer(currentMarker);
                }
                
                // Add new marker
                currentMarker = L.marker([lat, lon], {
                    icon: L.divIcon({
                        className: 'location-marker',
                        html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-green-600"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32]
                    })
                }).addTo(map)
                .bindPopup(`<b>Your Location</b><br>${address}`)
                .openPopup();

                // Center map on marker
                map.setView([lat, lon], 16);
                
                // Show map container
                mapContainer.classList.remove('hidden');
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        }
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.add('opacity-0', 'transition-opacity', 'duration-300');
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }
});