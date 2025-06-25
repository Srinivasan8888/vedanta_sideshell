import requests
import random
import time
from datetime import datetime

def generate_sensor_data(waveguide):
    """Generate random sensor data for a waveguide"""
    data = {
        "id": "XY001",
        "waveguide": waveguide,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # Generate random values for all 38 sensors
    for i in range(1, 39):
        key = f"sensor{i}"
        data[key] = str(round(random.uniform(10.0, 100.0), 2))
    
    return data

def send_data(url, data):
    """Send data to the API endpoint"""
    try:
        response = requests.post(url, params=data)
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Sent data for {data['waveguide']}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        return True
    except Exception as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Error sending data: {e}")
        return False

def main():
    # API endpoint
    url = "http://localhost:4000/api/v1/createSensor"
    
    # Run indefinitely
    while True:
        start_time = time.time()
        
        # Send 5 data points (one every 12 seconds)
        for i in range(5):
            # Alternate between WG1 and WG2
            waveguide = "WG1" if i % 2 == 0 else "WG2"
            
            # Generate and send data
            data = generate_sensor_data(waveguide)
            send_data(url, data)
            
            # Wait 12 seconds before next data point (5 points * 12s = 60s = 1 minute)
            if i < 4:  # Don't wait after the last data point in the batch
                time.sleep(12)
        
        # Calculate remaining time to maintain 1-minute intervals between batches
        elapsed_time = time.time() - start_time
        remaining_time = max(0, 60 - elapsed_time)
        if remaining_time > 0:
            print(f"Waiting {remaining_time:.1f} seconds until next batch...\n")
            time.sleep(remaining_time)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nScript stopped by user")
