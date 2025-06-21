import requests
import random
import time

# Static values
data = {
    "id": "XY001",
    "waveguide": "WG1",
    "time": time.strftime("%Y-%m-%d %H:%M:%S")  # Changed from 'TIME' to 'time'
}

# # Populate sensor1 to sensor24 with random values and sensor25 to sensor38 with "null"
for i in range(1, 39):
    key = f"sensor{i}"
    if i <= 24:
        data[key] = str(round(random.uniform(10.0, 100.0), 2))  # Random values for sensors 1-24
    else:
        data[key] = "null"  # null for sensors 25-38


# for i in range(1, 39):
#     key = f"sensor{i}"
#     data[key] = str(round(random.uniform(10.0, 100.0), 2))  # Random values for sensors 1-24
   

# Replace with your actual API endpoint
url = "http://localhost:4000/api/v1/createSensor"  # Example URL

try:
    response = requests.post(url, params=data)  # Use .post() if your endpoint expects POST
    print("Status:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Error sending data:", e)
