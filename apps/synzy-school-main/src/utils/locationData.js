// Indian States and Cities Data Mapping for School Predictor

export const stateOptions = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 
  'Ladakh', 'Lakshadweep', 'Puducherry'
];

export const popularCities = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Thane', state: 'Maharashtra' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Delhi', state: 'Delhi' }
];

export const stateCitiesMap = {
  'Maharashtra': [
    'Mumbai', 'Pune', 'Thane', 'Nagpur', 'Nashik', 'Pimpri-Chinchwad', 
    'Kalyan-Dombivli', 'Vasai-Virar', 'Navi Mumbai', 'Aurangabad', 
    'Solapur', 'Kolhapur', 'Amravati', 'Nanded', 'Sangli', 'Jalgaon', 
    'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Panvel'
  ],
  'Telangana': [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam', 
    'Khammam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 
    'Siddipet', 'Miryalaguda', 'Secunderabad', 'Mancherial'
  ],
  'Karnataka': [
    'Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 
    'Davanagere', 'Ballari', 'Vijayapura', 'Shivamogga', 'Tumakuru', 
    'Raichur', 'Bidar', 'Hosapete', 'Gadag', 'Udupi', 'Hassan'
  ],
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 
    'Rajahmundry', 'Tirupati', 'Kakinada', 'Kadapa', 'Anantapur', 
    'Vizianagaram', 'Eluru', 'Ongole', 'Nandyal', 'Machilipatnam', 
    'Tenali', 'Chittoor', 'Hindupur', 'Srikakulam'
  ],
  'Delhi': [
    'Delhi', 'New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 
    'West Delhi', 'Central Delhi', 'Dwarka', 'Rohini', 'Connaught Place', 
    'Saket', 'Vasant Kunj'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 
    'Tiruppur', 'Erode', 'Tirunelveli', 'Vellore', 'Thoothukudi', 
    'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 'Kanchipuram'
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 
    'Junagadh', 'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Nadiad', 
    'Surendranagar', 'Bharuch', 'Mehsana', 'Vapi'
  ],
  'Uttar Pradesh': [
    'Lucknow', 'Kanpur', 'Noida', 'Greater Noida', 'Ghaziabad', 'Agra', 
    'Varanasi', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh', 'Moradabad', 
    'Saharanpur', 'Gorakhpur', 'Jhansi', 'Mathura', 'Ayodhya', 'Firozabad'
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 
    'Malda', 'Baharampur', 'Kharagpur', 'Haldia', 'Darjeeling'
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 
    'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar'
  ],
  'Kerala': [
    'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 
    'Kannur', 'Alappuzha', 'Kottayam', 'Palakkad', 'Malappuram'
  ],
  'Madhya Pradesh': [
    'Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 
    'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Khandwa', 'Singrauli'
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 
    'Mohali', 'Hoshiarpur', 'Batala', 'Pathankot', 'Moga'
  ],
  'Haryana': [
    'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 
    'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'
  ],
  'Bihar': [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 
    'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar'
  ],
  'Odisha': [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 
    'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda'
  ],
  'Assam': [
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 
    'Tinsukia', 'Tezpur', 'Bongaigaon'
  ],
  'Jharkhand': [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 
    'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh'
  ],
  'Chhattisgarh': [
    'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 
    'Jagdalpur', 'Raigarh', 'Ambikapur'
  ],
  'Uttarakhand': [
    'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 
    'Kashipur', 'Rishikesh', 'Nainital'
  ],
  'Goa': [
    'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'
  ],
  'Himachal Pradesh': [
    'Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Baddi'
  ],
  'Jammu and Kashmir': [
    'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Kathua'
  ],
  'Ladakh': [
    'Leh', 'Kargil'
  ],
  'Chandigarh': [
    'Chandigarh'
  ],
  'Puducherry': [
    'Puducherry', 'Karaikal', 'Ozhukarai', 'Mahe', 'Yanam'
  ],
  'Tripura': [
    'Agartala', 'Dharmanagar', 'Udaipur'
  ],
  'Meghalaya': [
    'Shillong', 'Tura', 'Jowai'
  ],
  'Manipur': [
    'Imphal', 'Thoubal', 'Churachandpur'
  ],
  'Nagaland': [
    'Dimapur', 'Kohima', 'Mokokchung'
  ],
  'Mizoram': [
    'Aizawl', 'Lunglei', 'Champhai'
  ],
  'Sikkim': [
    'Gangtok', 'Namchi', 'Geyzing'
  ],
  'Arunachal Pradesh': [
    'Itanagar', 'Naharlagun', 'Pasighat'
  ],
  'Andaman and Nicobar Islands': [
    'Port Blair'
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Daman', 'Diu', 'Silvassa'
  ],
  'Lakshadweep': [
    'Kavaratti', 'Agatti'
  ]
};

/**
 * Returns sorted list of cities for a given state name (case-insensitive)
 * @param {string} stateName 
 * @returns {string[]}
 */
export const getCitiesForState = (stateName) => {
  if (!stateName || typeof stateName !== 'string') return [];
  const normalized = stateName.trim().toLowerCase();
  
  const key = Object.keys(stateCitiesMap).find(
    k => k.toLowerCase() === normalized
  );
  
  if (!key) return [];
  return [...stateCitiesMap[key]].sort((a, b) => a.localeCompare(b));
};
