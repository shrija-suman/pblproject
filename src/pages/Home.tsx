
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {Calendar, Users, TrendingUp, Award} from 'lucide-react'

import EventCard from '../components/EventCard'
import toast from 'react-hot-toast'

interface Event {
  _id: string
  title: string
  description: string
  eventDate: string
  venue: string
  registrationLimit: number
  currentRegistrations: number
  status: string
  category: string
  imageUrl?: string
}

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalClubs: 0,
    totalRegistrations: 0,
    upcomingEvents: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

const fetchData = async () => {
  try {
    setLoading(true)

    const res = await fetch("http://localhost:5000/api/events") // Make sure port is correct
    if (!res.ok) throw new Error('Network response was not ok')
    
    const events: Event[] = await res.json()

    setFeaturedEvents(events.slice(0, 3))

    setStats({
      totalEvents: events.length,
      totalClubs: 8, // hardcode for now or fetch /clubs endpoint
      totalRegistrations: events.reduce((sum, e) => sum + e.currentRegistrations, 0),
      upcomingEvents: events.filter(e => new Date(e.eventDate) > new Date()).length
    })

  } catch (error) {
    console.error(error)
    toast.error('Failed to load data')
  } finally {
    setLoading(false)
  }
}




  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              CampusConnect
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover, join, and organize amazing campus events
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/events"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Browse Events
              </Link>
              <Link
                to="/clubs"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Explore Clubs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalEvents}</div>
              <div className="text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalClubs}</div>
              <div className="text-gray-600">Active Clubs</div>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalRegistrations}</div>
              <div className="text-gray-600">Registrations</div>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.upcomingEvents}</div>
              <div className="text-gray-600">Upcoming</div>
            </div>
          </div>
        </div>
      </div>



      {/* Featured Events Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Events</h2>
            <p className="text-xl text-gray-600">Don't miss these upcoming highlights</p>
          </div>

          {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  showRegisterButton={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No featured events available at the moment.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/events"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View All Events
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Involved?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join the campus community and make the most of your college experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/events"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Find Events
            </Link>
            <Link
              to="/clubs"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Join a Club
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
