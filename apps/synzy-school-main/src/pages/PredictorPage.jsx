import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronDown, User, MapPin, Building, Navigation, Heart,
  CheckCircle2, GraduationCap, Clock, BookOpen, AlertCircle,
  Search, Sparkles, X, RefreshCw, Award, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { predictSchools, reverseGeocodeLocation } from '../api/predictorService';
import SchoolCard from '../components/SchoolCard';
import { toast } from 'react-toastify';
import BackButton from '../components/BackButton';
import { useAuth } from '../context/AuthContext';
import {
  stateOptions,
  popularCities,
  getCitiesForState
} from '../utils/locationData';

// Constants for dropdown options
const schoolTypes = ['All Types', 'Private', 'Government', 'Convent'];
const shiftOptions = ['All Shifts', 'Morning', 'Afternoon', 'Night School'];
const standardOptions = [
  'All Standards',
  'Nursery', 'LKG', 'UKG',
  '1st Class', '2nd Class', '3rd Class', '4th Class',
  '5th Class', '6th Class', '7th Class', '8th Class',
  '9th Class', '10th Class', '11th Class', '12th Class'
];
const genderOptions = ['Any / Co-educational', 'Male (Boys / Co-ed)', 'Female (Girls / Co-ed)', 'Co-educational Only'];
const boardOptions = ['All Boards', 'CBSE', 'ICSE', 'SSC', 'IB', 'IGCSE', 'CISCE', 'NIOS'];

const interestsOptions = [
  'All Interests',
  'Sports', 'Music', 'Dance', 'Art & Craft', 'Science', 'Mathematics',
  'Literature', 'Technology', 'Debate', 'Theater', 'Photography', 'Chess',
  'Focusing on Academics', 'Focuses on Practical Learning', 'Focuses on Theoretical Learning',
  'Empowering in Sports', 'Empowering in Arts', 'Special Focus on Mathematics',
  'Special Focus on Science', 'Special Focus on Physical Education',
  'Leadership Development', 'STEM Activities', 'Cultural Education',
  'Technology Integration', 'Environmental Awareness'
];

/**
 * FieldWrapper: Standardizes label, error message, and layout for form controls
 */
const FieldWrapper = ({ label, required, error, children, id, className = '' }) => (
  <div className={`flex flex-col mb-4 ${className}`} id={id}>
    <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
      {label}
      {required && <span className="text-red-500 ml-1 font-bold">*</span>}
    </label>
    {children}
    {error && (
      <div className="flex items-center text-red-500 text-xs mt-1.5 animate-pulse">
        <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
        {error}
      </div>
    )}
  </div>
);

/**
 * DropdownField: Defined OUTSIDE main component to prevent DOM remounting on parent state changes.
 * Uses explicit ref-based click outside listener, native button trigger, and isolated search filtering.
 */
const DropdownField = ({
  label,
  field,
  icon: Icon,
  required = false,
  options = [],
  placeholder,
  isOpen,
  selectedValue,
  error,
  onToggle,
  onClose,
  onSelect,
  searchable = false,
  disabled = false,
  disabledReason = '',
  allowCustomInput = false,
  helperText = ''
}) => {
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle outside click specifically for this dropdown instance
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };

    // A slight delay ensures the opening click event doesn't immediately close the menu
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      if (searchable) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    } else {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  // Filter options based on local search input
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const query = searchQuery.trim().toLowerCase();
    return options.filter(opt => opt.toLowerCase().includes(query));
  }, [options, searchable, searchQuery]);

  const hasExactMatch = useMemo(() => {
    if (!searchQuery.trim()) return true;
    return options.some(opt => opt.toLowerCase() === searchQuery.trim().toLowerCase());
  }, [options, searchQuery]);

  return (
    <FieldWrapper label={label} required={required} error={error} id={field} className={isOpen ? 'relative z-30' : 'relative'}>
      <div
        ref={containerRef}
        className={`relative w-full custom-dropdown-container ${isOpen ? 'z-50' : 'z-10'}`}
      >
        <button
          type="button"
          id={`${field}-trigger`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (disabled) {
              if (disabledReason) toast.info(disabledReason);
              return;
            }
            onToggle();
          }}
          className={`w-full min-h-[48px] px-3.5 py-3 rounded-xl bg-white shadow-sm border transition-all flex items-center justify-between text-left select-none outline-none ${disabled
            ? 'bg-gray-50/80 border-gray-200 text-gray-400 cursor-not-allowed'
            : error
              ? 'border-red-400 ring-1 ring-red-400 cursor-pointer'
              : isOpen
                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md cursor-pointer'
                : 'border-gray-200 hover:border-blue-300 cursor-pointer'
            }`}
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            {Icon && (
              <div className={`transition-colors flex-shrink-0 ${disabled ? 'text-gray-300' : isOpen ? 'text-blue-600' : 'text-gray-400'}`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <span className={`truncate text-sm sm:text-base ${selectedValue ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
              {selectedValue || placeholder}
            </span>
          </div>
          <div className={`transition-transform duration-200 text-gray-400 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>

        {isOpen && !disabled && (
          <div
            className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200/90 rounded-2xl shadow-2xl z-50 py-1.5 overflow-hidden ring-1 ring-black/5"
            role="listbox"
          >
            {searchable && (
              <div className="p-2 border-b border-gray-100 bg-gray-50/80">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={`Search ${label.toLowerCase()}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        onClose();
                      }
                      if (e.key === 'Enter' && filteredOptions.length > 0) {
                        e.preventDefault();
                        onSelect(filteredOptions[0]);
                        onClose();
                      }
                    }}
                    className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="max-h-56 overflow-y-auto dropdown-scroll">
              {filteredOptions.length === 0 && (!allowCustomInput || !searchQuery.trim()) ? (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">No options found</div>
              ) : (
                <>
                  {filteredOptions.map((option) => {
                    const isSelected = selectedValue === option;
                    return (
                      <div
                        key={option}
                        role="option"
                        aria-selected={isSelected}
                        onMouseDown={(e) => e.preventDefault()} // Prevents premature blur
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onSelect(option);
                          onClose();
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors ${isSelected
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-gray-700 hover:bg-blue-50/70 hover:text-blue-600'
                          }`}
                      >
                        <span className="truncate">{option}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />}
                      </div>
                    );
                  })}

                  {/* Allow selecting custom typed city if not already in predefined list */}
                  {allowCustomInput && searchQuery.trim() && !hasExactMatch && (
                    <div
                      role="option"
                      aria-selected={false}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelect(searchQuery.trim());
                        onClose();
                      }}
                      className="px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between text-blue-600 bg-blue-50/50 hover:bg-blue-100/70 border-t border-blue-100 font-medium"
                    >
                      <span className="truncate">Use &quot;{searchQuery.trim()}&quot;</span>
                      <Sparkles className="w-3.5 h-3.5 ml-2" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {helperText && <p className="text-xs text-gray-400 mt-1">{helperText}</p>}
    </FieldWrapper>
  );
};

/**
 * TextInputField: Standard text input component defined outside to avoid remounting
 */
const TextInputField = ({ label, field, icon: Icon, required = false, placeholder, value, error, onChange, helperText }) => (
  <FieldWrapper label={label} required={required} error={error} id={field}>
    <div className={`relative w-full rounded-xl bg-white shadow-sm border ${error ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200 hover:border-blue-300'} transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 group`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors z-10">
        <Icon className="w-5 h-5" />
      </div>
      <input
        type="text"
        id={field}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-4 py-3 bg-transparent border-none rounded-xl focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400 text-base"
      />
    </div>
    {helperText && <p className="text-xs text-gray-400 mt-1">{helperText}</p>}
  </FieldWrapper>
);

const PredictorPage = ({
  onCompareToggle,
  comparisonList = [],
  shortlist = [],
  onShortlistToggle
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    board: 'All Boards',
    schoolType: 'All Types',
    preferredShifts: 'All Shifts',
    preferredStandard: 'All Standards',
    gender: 'Any / Co-educational',
    state: '',
    city: '',
    area: '',
    interests: 'All Interests'
  });

  const [cityOptions, setCityOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Close dropdown on global Escape key
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Generic input change handler
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  /**
   * Dedicated State change handler:
   * 1. Immediately logs debug statements
   * 2. Immediately clears selected city
   * 3. Loads cities belonging ONLY to the newly selected State
   * 4. Updates form data without stale state
   */
  const handleStateChange = (newState) => {
    console.log("State selected:", newState);
    console.log("City cleared because state changed");
    console.log("Loading cities for:", newState);

    const newCities = getCitiesForState(newState);

    setFormData(prev => ({
      ...prev,
      state: newState,
      city: '' // Immediately clear city when state changes
    }));

    setCityOptions(newCities);

    setErrors(prev => ({
      ...prev,
      state: '',
      city: ''
    }));
  };

  /**
   * Synchronize dependent cities if state changes through any other mechanism
   */
  useEffect(() => {
    if (!formData.state) {
      setCityOptions([]);
      if (formData.city) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
      return;
    }

    const cities = getCitiesForState(formData.state);
    setCityOptions(cities);

    // If existing city doesn't belong to the newly active state, clear it
    if (formData.city && !cities.includes(formData.city)) {
      console.log("City cleared because state changed and city does not belong to new state");
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.state]);

  /**
   * Handle Quick City button clicks:
   * Automatically sets state, loads corresponding cities, and selects city
   */
  const handleQuickCitySelect = (item) => {
    console.log("State selected:", item.state);
    console.log("Loading cities for:", item.state);

    const newCities = getCitiesForState(item.state);
    setCityOptions(newCities);

    setFormData(prev => ({
      ...prev,
      state: item.state,
      city: item.city
    }));

    setErrors(prev => ({
      ...prev,
      state: '',
      city: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.state) {
      newErrors.state = 'Please select a state to predict schools';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Helper to normalize and resolve State from geocoding data
   */
  const resolveStateName = (rawState) => {
    if (!rawState) return '';
    const cleanRaw = rawState
      .replace(/^(state of|union territory of|ut of|nct of|national capital territory of)\s+/i, '')
      .replace(/\s+(state|ut)$/i, '')
      .trim();

    // 1. Exact match
    const exact = stateOptions.find(s => s.toLowerCase() === cleanRaw.toLowerCase());
    if (exact) return exact;

    // 2. Contains match
    const contains = stateOptions.find(s =>
      cleanRaw.toLowerCase().includes(s.toLowerCase()) ||
      s.toLowerCase().includes(cleanRaw.toLowerCase())
    );
    if (contains) return contains;

    return rawState;
  };

  /**
   * GPS / Auto-fill Location handler with multi-tier fallbacks:
   * 1. Dual accuracy geolocation (tries high-accuracy then standard WiFi/IP accuracy)
   * 2. Dual reverse geocoder (Backend API with Nominatim/Photon/BDC, fallback to direct browser geocode)
   */
  const handleGoogleLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocationLoading(true);

    // Process latitude/longitude coordinates through reverse geocoders
    const processCoordinates = async (coords) => {
      const { latitude, longitude } = coords;
      let rawState = '';
      let rawCity = '';
      let rawArea = '';

      // Tier 1: Try application's backend reverse-geocoding endpoint
      try {
        const res = await reverseGeocodeLocation(latitude, longitude);
        if (res) {
          rawState = res.state || '';
          rawCity = res.city || '';
          rawArea = res.area || '';
        }
      } catch (backendErr) {
        console.warn('Backend reverse geocode failed, trying browser direct geocode:', backendErr.message);
      }

      // Tier 2: Direct browser fallback to BigDataCloud if state was not retrieved
      if (!rawState) {
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (response.ok) {
            const data = await response.json();
            rawState = data.principalSubdivision || '';
            rawCity = data.city || data.locality || data.localityInfo?.administrative?.[3]?.name || '';
            rawArea = data.locality || '';
          }
        } catch (bdcErr) {
          console.warn('BigDataCloud direct fetch failed:', bdcErr.message);
        }
      }

      // Tier 3: Direct browser fallback to OpenStreetMap
      if (!rawState) {
        try {
          const osmRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (osmRes.ok) {
            const osmData = await osmRes.json();
            const addr = osmData.address || {};
            rawState = addr.state || '';
            rawCity = addr.city || addr.town || addr.village || addr.county || '';
            rawArea = addr.suburb || addr.neighbourhood || addr.locality || '';
          }
        } catch (osmErr) {
          console.warn('OSM fallback failed:', osmErr.message);
        }
      }

      const finalState = resolveStateName(rawState);

      if (!finalState) {
        toast.error('Could not identify your state from GPS coordinates. Please select State manually.');
        setIsLocationLoading(false);
        return;
      }

      // Load state's canonical cities
      const citiesForState = getCitiesForState(finalState);

      // Match city to state's list if possible, or preserve raw city
      let matchedCity = '';
      if (rawCity) {
        const canonical = citiesForState.find(c =>
          c.toLowerCase() === rawCity.toLowerCase() ||
          c.toLowerCase().includes(rawCity.toLowerCase()) ||
          rawCity.toLowerCase().includes(c.toLowerCase())
        );
        matchedCity = canonical || rawCity;
      }

      // Ensure city is available in options list
      if (matchedCity && !citiesForState.includes(matchedCity)) {
        setCityOptions([matchedCity, ...citiesForState]);
      } else {
        setCityOptions(citiesForState);
      }

      setFormData(prev => ({
        ...prev,
        state: finalState,
        city: matchedCity || '',
        area: rawArea || prev.area
      }));

      setErrors(prev => ({ ...prev, state: '', city: '', area: '' }));
      toast.success(`📍 Location detected: ${matchedCity ? matchedCity + ', ' : ''}${finalState}`);
      setIsLocationLoading(false);
    };

    // Geolocation with fallback from High Accuracy to Standard Accuracy
    navigator.geolocation.getCurrentPosition(
      (position) => processCoordinates(position.coords),
      (highAccError) => {
        console.warn('High-accuracy GPS timed out/failed, retrying with standard WiFi/IP accuracy:', highAccError.message);
        navigator.geolocation.getCurrentPosition(
          (position) => processCoordinates(position.coords),
          (lowAccError) => {
            console.error('Geolocation failed completely:', lowAccError);
            if (lowAccError.code === 1) {
              toast.error('Location permission denied. Please allow location access in your browser settings.');
            } else if (lowAccError.code === 2) {
              toast.error('Position unavailable. Please ensure location services are enabled on your device.');
            } else if (lowAccError.code === 3) {
              toast.error('Location request timed out. Please select your State manually.');
            } else {
              toast.error('Unable to retrieve location. Please select State manually.');
            }
            setIsLocationLoading(false);
          },
          { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
    );
  };

  /**
   * Search / Predict Schools submission
   */
  const handleGetSchools = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!validateForm()) {
      toast.error('Please select at least a State to search');
      const firstError = Object.keys(errors)[0] || 'state';
      document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const payload = {
        board: formData.board && formData.board !== 'All Boards' ? formData.board : undefined,
        schoolMode: formData.schoolType === 'Convent' ? 'convent' :
          formData.schoolType === 'Private' ? 'private' :
            formData.schoolType === 'Government' ? 'government' : undefined,
        genderType: formData.gender === 'Male (Boys / Co-ed)' ? 'boy' :
          formData.gender === 'Female (Girls / Co-ed)' ? 'girl' :
            formData.gender === 'Co-educational Only' ? 'co-ed' : undefined,
        shifts: formData.preferredShifts === 'Morning' ? 'morning' :
          formData.preferredShifts === 'Afternoon' ? 'afternoon' :
            formData.preferredShifts === 'Night School' ? 'night school' : undefined,
        upto: formData.preferredStandard && formData.preferredStandard !== 'All Standards'
          ? formData.preferredStandard.replace(/\D/g, '') || formData.preferredStandard.toLowerCase()
          : undefined,
        standard: formData.preferredStandard && formData.preferredStandard !== 'All Standards'
          ? formData.preferredStandard.replace(/\D/g, '') || formData.preferredStandard.toLowerCase()
          : undefined,
        state: formData.state ? formData.state.trim() : undefined,
        city: formData.city ? formData.city.trim() : undefined,
        area: formData.area ? formData.area.trim() : undefined,
        activities: formData.interests && formData.interests !== 'All Interests' ? [formData.interests] : []
      };

      const resp = await predictSchools(payload);
      const list = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
      setSearchResults(list);

      if (list.length === 0) {
        toast.info('No schools found matching those exact filters. Try broadening criteria or selecting All Cities.');
      } else {
        toast.success(`Found ${list.length} matching school${list.length > 1 ? 's' : ''}!`);
        setTimeout(() => {
          document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } catch (error) {
      console.error('Error predicting schools:', error);
      toast.error('Failed to fetch school predictions. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset form completely
   */
  const clearAll = () => {
    setFormData({
      board: 'All Boards',
      schoolType: 'All Types',
      preferredShifts: 'All Shifts',
      preferredStandard: 'All Standards',
      gender: 'Any / Co-educational',
      state: '',
      city: '',
      area: '',
      interests: 'All Interests'
    });
    setCityOptions([]);
    setErrors({});
    setSearchResults([]);
    setHasSearched(false);
    setOpenDropdown(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-xl relative">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-8 sm:p-10 text-center relative overflow-hidden rounded-t-3xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-blue-100 text-xs sm:text-sm font-medium mb-3 border border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span>Smart Educational Recommendation Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
                Find Your Perfect School
              </h1>
              <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                Discover the top institutions tailored specifically to your academic preferences, location, shift, and extracurricular interests.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <form onSubmit={handleGetSchools}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-6">

                {/* Academic Preferences Column */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-gray-100">
                    <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 shadow-xs">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800">Academic Preferences</h2>
                      <p className="text-xs text-gray-500">Fine-tune grade level, curriculum, and structure</p>
                    </div>
                  </div>

                  {/* 1. Education Board */}
                  <DropdownField
                    label="Education Board"
                    field="board"
                    icon={Award}
                    options={boardOptions}
                    placeholder="Select Board"
                    isOpen={openDropdown === 'board'}
                    selectedValue={formData.board}
                    error={errors.board}
                    onToggle={() => setOpenDropdown(prev => prev === 'board' ? null : 'board')}
                    onClose={() => setOpenDropdown(null)}
                    onSelect={(val) => handleInputChange('board', val)}
                  />

                  {/* 2. School Type */}
                  <DropdownField
                    label="School Type"
                    field="schoolType"
                    icon={Building}
                    options={schoolTypes}
                    placeholder="Select School Type"
                    isOpen={openDropdown === 'schoolType'}
                    selectedValue={formData.schoolType}
                    error={errors.schoolType}
                    onToggle={() => setOpenDropdown(prev => prev === 'schoolType' ? null : 'schoolType')}
                    onClose={() => setOpenDropdown(null)}
                    onSelect={(val) => handleInputChange('schoolType', val)}
                  />

                  {/* 3. Preferred Shifts */}
                  <DropdownField
                    label="Preferred Shifts"
                    field="preferredShifts"
                    icon={Clock}
                    options={shiftOptions}
                    placeholder="Select Shift"
                    isOpen={openDropdown === 'preferredShifts'}
                    selectedValue={formData.preferredShifts}
                    error={errors.preferredShifts}
                    onToggle={() => setOpenDropdown(prev => prev === 'preferredShifts' ? null : 'preferredShifts')}
                    onClose={() => setOpenDropdown(null)}
                    onSelect={(val) => handleInputChange('preferredShifts', val)}
                  />

                  {/* 4. Target Standard / Class */}
                  <DropdownField
                    label="Target Standard / Class"
                    field="preferredStandard"
                    icon={BookOpen}
                    options={standardOptions}
                    placeholder="Select Standard"
                    isOpen={openDropdown === 'preferredStandard'}
                    selectedValue={formData.preferredStandard}
                    error={errors.preferredStandard}
                    onToggle={() => setOpenDropdown(prev => prev === 'preferredStandard' ? null : 'preferredStandard')}
                    onClose={() => setOpenDropdown(null)}
                    onSelect={(val) => handleInputChange('preferredStandard', val)}
                  />

                  {/* 5. Gender Focus */}
                  <DropdownField
                    label="Gender Focus"
                    field="gender"
                    icon={User}
                    options={genderOptions}
                    placeholder="Select Gender Focus"
                    isOpen={openDropdown === 'gender'}
                    selectedValue={formData.gender}
                    error={errors.gender}
                    onToggle={() => setOpenDropdown(prev => prev === 'gender' ? null : 'gender')}
                    onClose={() => setOpenDropdown(null)}
                    onSelect={(val) => handleInputChange('gender', val)}
                  />
                </div>

                {/* Location Preferences Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                    <div className="flex items-center space-x-2.5">
                      <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 shadow-xs">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Location Preferences</h2>
                        <p className="text-xs text-gray-500">Pick state and city or auto-detect GPS</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLocation}
                      disabled={isLocationLoading}
                      className="text-xs sm:text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-full transition-all flex items-center disabled:opacity-50 border border-indigo-200 cursor-pointer active:scale-95 shadow-xs"
                      title="Auto-fill your current location"
                    >
                      {isLocationLoading ? (
                        <div className="animate-spin w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full mr-1.5"></div>
                      ) : (
                        <Navigation className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                      )}
                      Use GPS
                    </button>
                  </div>

                  {/* 6. State (Searchable Custom Dropdown) */}
                  <DropdownField
                    label="State"
                    field="state"
                    icon={MapPin}
                    options={stateOptions}
                    required={true}
                    placeholder="Select State (Required)"
                    isOpen={openDropdown === 'state'}
                    selectedValue={formData.state}
                    error={errors.state}
                    onToggle={() => setOpenDropdown(prev => prev === 'state' ? null : 'state')}
                    onClose={() => setOpenDropdown(null)}
                    onSelect={handleStateChange}
                    searchable={true}
                  />

                  {/* 7. City (Dependent Searchable Custom Dropdown) */}
                  <div>
                    <DropdownField
                      label="City"
                      field="city"
                      icon={Building}
                      options={cityOptions}
                      placeholder={formData.state ? `Select City in ${formData.state}` : "Select a State first"}
                      isOpen={openDropdown === 'city'}
                      selectedValue={formData.city}
                      error={errors.city}
                      disabled={!formData.state}
                      disabledReason="Please select a State first to view available cities"
                      onToggle={() => {
                        if (!formData.state) {
                          toast.info('Please select a State first to view available cities');
                          setOpenDropdown('state');
                          return;
                        }
                        setOpenDropdown(prev => prev === 'city' ? null : 'city');
                      }}
                      onClose={() => setOpenDropdown(null)}
                      onSelect={(val) => handleInputChange('city', val)}
                      searchable={true}
                      allowCustomInput={true}
                      helperText={formData.state ? "Optional: Leave empty to see all top schools in the state" : "Select a state above to enable city selection"}
                    />

                    {/* Quick City Suggestion Pills */}
                    <div className="mt-2 mb-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span className="text-xs font-semibold text-gray-600">Quick Cities:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {popularCities.map((item) => {
                          const isActive = formData.city?.toLowerCase() === item.city.toLowerCase() &&
                            formData.state?.toLowerCase() === item.state.toLowerCase();
                          return (
                            <button
                              key={item.city}
                              type="button"
                              onClick={() => handleQuickCitySelect(item)}
                              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${isActive
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-semibold'
                                : 'bg-gray-50/90 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 border-gray-200/90 hover:border-indigo-200'
                                }`}
                            >
                              {item.city}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 8. Area / Locality */}
                  <TextInputField
                    label="Area / Locality"
                    field="area"
                    icon={MapPin}
                    placeholder="e.g. Andheri, Connaught Place, Whitefield (Optional)"
                    value={formData.area}
                    error={errors.area}
                    onChange={handleInputChange}
                    helperText="Optional: Narrows matches to a specific neighborhood"
                  />
                </div>
              </div>

              {/* Full-Width Form Action Footer */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center text-xs text-gray-500 space-x-2 order-2 sm:order-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Matches based on verified school data &amp; AI insights</span>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={clearAll}
                    className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-xl border border-gray-200 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" />
                    Reset
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 sm:flex-none px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold text-base shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 transform hover:-translate-y-0.5 active:translate-y-0 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2.5"></div>
                        Predicting Ideal Matches...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 text-yellow-300" />
                        Discover Best Schools
                        <CheckCircle2 className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div id="search-results" className="mt-12 scroll-mt-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center">
                  Predicted School Matches
                  <span className="ml-3 px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full border border-green-200">
                    {searchResults.length} {searchResults.length === 1 ? 'School' : 'Schools'} Found
                  </span>
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Showing top recommendations based on {formData.state}{formData.city ? `, ${formData.city}` : ''}
                </p>
              </div>

              {/* Quick filter summary chips */}
              <div className="flex flex-wrap gap-1.5">
                {formData.state && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 font-medium">
                    📍 {formData.state}
                  </span>
                )}
                {formData.city && (
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200 font-medium">
                    🏙️ {formData.city}
                  </span>
                )}
                {formData.schoolType && formData.schoolType !== 'All Types' && (
                  <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200 font-medium">
                    🏫 {formData.schoolType}
                  </span>
                )}
                {formData.preferredStandard && formData.preferredStandard !== 'All Standards' && (
                  <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 font-medium">
                    📚 {formData.preferredStandard}
                  </span>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                <div className="inline-block relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                    <Building className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-800">Analyzing matching schools...</h3>
                <p className="text-gray-500 mt-2 text-sm">Evaluating accreditation, shifts, location, and standards</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchResults.map((school, index) => {
                  const sId = school._id || school.id || school.schoolId || `school-${index}`;
                  const isCompared = comparisonList?.some(
                    s => (s._id || s.schoolId || s.id) === (school._id || school.schoolId || school.id)
                  );
                  const isShortlisted = shortlist?.some(
                    s => (s._id || s.schoolId || s.id) === (school._id || school.schoolId || school.id)
                  );

                  return (
                    <div key={sId} className="transform transition-all duration-300 hover:-translate-y-1">
                      <SchoolCard
                        school={school}
                        onCardClick={() => navigate(`/school/${sId}`)}
                        onCompareToggle={onCompareToggle ? () => onCompareToggle(school) : undefined}
                        isCompared={isCompared}
                        currentUser={currentUser}
                        onShortlistToggle={onShortlistToggle ? () => onShortlistToggle(school) : undefined}
                        isShortlisted={isShortlisted}
                        onApply={() => navigate(`/apply/${sId}`)}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100 max-w-2xl mx-auto">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-600">
                  <Building className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No matching schools found</h3>
                <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto mb-6 leading-relaxed">
                  We could not find any schools matching your exact filter set. Try broadening your criteria, choosing a different city or standard, or clearing specific filters.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        schoolType: 'All Types',
                        preferredShifts: 'All Shifts',
                        preferredStandard: 'All Standards',
                        gender: 'Any / Co-educational',
                        interests: 'All Interests',
                        city: ''
                      }));
                      handleGetSchools();
                    }}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-md transition-colors cursor-pointer"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Broaden Criteria & Retry
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('state')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Change State / City
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictorPage;