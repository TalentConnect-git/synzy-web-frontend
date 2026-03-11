import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  GraduationCap, 
  Star, 
  ArrowRight, 
  Users, 
  Building, 
  DollarSign,
  Filter,
  Heart,
  GitCompare,
  Eye,
  ArrowLeft  // Added ArrowLeft here
} from 'lucide-react';
import { searchcolleges } from '../api/searchService';
import { getUserPreferences } from '../api/preferencesService';
import CollegeCard from '../components/CollegeCard';
import { useAuth } from '../context/AuthContext';

const HomePage = ({ onCompareToggle, comparisonList, shortlist, onShortlistToggle }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [matchingcolleges, setMatchingcolleges] = useState([]);
  const [matchingCitycolleges, setMatchingCitycolleges] = useState([]);
  const [boardNearbycolleges, setBoardNearbycolleges] = useState([]);
  const [loading, setLoading] = useState({
    matching: false,
    matchingCity: false,
    boardNearby: false
  });

  // Default user preferences (will be overridden by user's actual preferences if available)
  const [userPreferences, setUserPreferences] = useState({
    boards: ['CBSE', 'ICSE'],
    cities: ['Mumbai', 'Delhi', 'Bangalore'],
    collegeMode: ['private'],
    genderType: ['co-ed'],
    feeRange: ['25000 - 50000', '50000 - 75000']
  });

  // Fetch colleges matching user preferences
  const fetchMatchingcolleges = async () => {
    setLoading(prev => ({ ...prev, matching: true }));
    try {
      const response = await searchcolleges({
        boards: userPreferences.boards,
        cities: userPreferences.cities,
        collegeMode: userPreferences.collegeMode,
        genderType: userPreferences.genderType,
        feeRange: userPreferences.feeRange,
        page: 1,
        limit: 6
      });
      setMatchingcolleges(response.data || []);
    } catch (error) {
      // Silently fall back to empty list to avoid console noise in UX
      setMatchingcolleges([]);
    } finally {
      setLoading(prev => ({ ...prev, matching: false }));
    }
  };

  // Fetch colleges matching preferences in the city
  const fetchMatchingCitycolleges = async () => {
    setLoading(prev => ({ ...prev, matchingCity: true }));
    try {
      const response = await searchcolleges({
        boards: userPreferences.boards,
        cities: userPreferences.cities?.length ? userPreferences.cities : ['Mumbai','Delhi','Bangalore'],
        collegeMode: userPreferences.collegeMode,
        genderType: userPreferences.genderType,
        feeRange: userPreferences.feeRange,
        page: 1,
        limit: 6
      });
      setMatchingCitycolleges(response.data || []);
    } catch (error) {
      // Silently fall back to empty list
      setMatchingCitycolleges([]);
    } finally {
      setLoading(prev => ({ ...prev, matchingCity: false }));
    }
  };

  // Fetch board colleges nearby (boards in user's preferred cities)
  const fetchBoardNearbycolleges = async () => {
    setLoading(prev => ({ ...prev, boardNearby: true }));
    try {
      const response = await searchcolleges({
        boards: userPreferences.boards?.length ? userPreferences.boards : ['CBSE','ICSE','IB'],
        cities: userPreferences.cities?.length ? userPreferences.cities : ['Mumbai','Delhi','Bangalore'],
        page: 1,
        limit: 6
      });
      setBoardNearbycolleges(response.data || []);
    } catch (error) {
      // Silently fall back to empty list
      setBoardNearbycolleges([]);
    } finally {
      setLoading(prev => ({ ...prev, boardNearby: false }));
    }
  };

  // Load user preferences on component mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (currentUser && (currentUser.authId || currentUser._id)) {
        try {
          const preferences = await getUserPreferences(currentUser.authId || currentUser._id);
          if (preferences) {
            setUserPreferences(preferences);
          }
        } catch (error) {
          // Use defaults silently
        }
      }
    };
    
    loadUserPreferences();
  }, [currentUser]);

  useEffect(() => {
    fetchMatchingcolleges();
    fetchMatchingCitycolleges();
    fetchBoardNearbycolleges();
  }, [userPreferences]);

  const collegeSection = ({ 
    title, 
    subtitle, 
    icon, 
    colleges, 
    loading, 
    emptyMessage,
    onViewAll,
    viewAllLink 
  }) => (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              {icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-gray-600">{subtitle}</p>
            </div>
          </div>
          <Link
            to={viewAllLink}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : colleges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((college) => (
              <CollegeCard
                key={college._id || college.id || college.collegeId}
                college={college}
                onCardClick={() => navigate(`/college/${college._id || college.id || college.collegeId}`)}
                onCompareToggle={onCompareToggle}
                isCompared={comparisonList?.some(item => (item.collegeId || item._id) === (college._id || college.id || college.collegeId))}
                currentUser={currentUser}
                onShortlistToggle={onShortlistToggle}
                isShortlisted={shortlist?.some(item => (item.collegeId || item._id) === (college._id || college.id || college.collegeId))}
                onApply={() => navigate(`/apply/${college._id || college.id || college.collegeId}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <GraduationCap size={48} className="mx-auto" />
            </div>
            <p className="text-gray-600 text-lg">{emptyMessage}</p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Search size={16} />
              Search colleges
            </Link>
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Back Button */}
      {/* <button
        onClick={() => navigate(-1)}
        className="fixed top-22 left-4 z-50 flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition-all duration-200 font-medium border border-gray-200"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button> */}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {currentUser ? `Welcome back, ${currentUser.email?.split('@')[0] || 'User'}!` : 'Find Your Perfect College'}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            {currentUser 
              ? 'Discover colleges that match your preferences and educational goals'
              : 'Discover, compare, and apply to the best colleges tailored to your preferences'
            }
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/search')}
              className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 shadow-lg text-lg flex items-center gap-2"
            >
              <Search size={20} />
              Start Your Search
            </button>
            <button
              onClick={() => navigate('/predictor')}
              className="bg-blue-500 text-white font-semibold px-8 py-4 rounded-lg hover:bg-blue-400 shadow-lg text-lg flex items-center gap-2"
            >
              <Filter size={20} />
              College Predictor
            </button>
          </div>
        </div>
      </section>

      {/* Section 1: college matching preference */}
      <collegeSection
        title="college matching preference"
        subtitle="Personalized picks based on your saved preferences"
        icon={<Star size={24} className="text-blue-600" />}
        colleges={matchingcolleges}
        loading={loading.matching}
        emptyMessage="No colleges match your current preferences. Try adjusting your filters or explore all colleges."
        viewAllLink="/search"
      />

      {/* Section 2: college matching preference in the city */}
      <collegeSection
        title="college matching preference in the city"
        subtitle="Matches in your preferred cities using your filters"
        icon={<MapPin size={24} className="text-green-600" />}
        colleges={matchingCitycolleges}
        loading={loading.matchingCity}
        emptyMessage="No matches in selected cities. Try changing city preferences."
        viewAllLink="/search"
      />

      {/* Section 3: Board college nearby */}
      <collegeSection
        title="Board college nearby"
        subtitle="CBSE, ICSE, IB colleges near your preferred locations"
        icon={<GraduationCap size={24} className="text-purple-600" />}
        colleges={boardNearbycolleges}
        loading={loading.boardNearby}
        emptyMessage="No nearby board colleges found. Explore all boards."
        viewAllLink="/search"
      />

      {/* Quick Actions Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/search"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center group"
            >
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Search size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Advanced Search</h3>
              <p className="text-gray-600 text-sm">Find colleges with detailed filters</p>
            </Link>

            <Link
              to="/predictor"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center group"
            >
              <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Filter size={24} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">college Predictor</h3>
              <p className="text-gray-600 text-sm">Get AI-powered recommendations</p>
            </Link>

            <Link
              to="/compare"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center group"
            >
              <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <GitCompare size={24} className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Compare colleges</h3>
              <p className="text-gray-600 text-sm">Side-by-side college comparison</p>
            </Link>

            <Link
              to="/colleges"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center group"
            >
              <div className="p-3 bg-orange-100 rounded-lg w-fit mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <Eye size={24} className="text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Browse All colleges</h3>
              <p className="text-gray-600 text-sm">Explore our complete database</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-blue-100">colleges Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Cities Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-blue-100">Education Boards</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;