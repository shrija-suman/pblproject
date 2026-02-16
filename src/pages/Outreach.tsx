import React, { useState, useEffect } from 'react'
import { Search, Filter, Calendar } from 'lucide-react'
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

const Outreach: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  const categories = ['concert', 'festival', 'standup', 'workshop', 'public']

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      const res = await fetch('http://localhost:5000/api/outreach')

      if (!res.ok) {
        throw new Error('Fetch failed')
      }

      const data = await res.json()

      const mappedEvents: Event[] = data.map((e: any) => ({
        _id: e.id,
        title: e.title || '',
        description: e.description || '',
        eventDate: e.eventDate || '',
        venue: e.venue || '',
        registrationLimit: e.registrationLimit || 0,
        currentRegistrations: e.currentRegistrations || 0,
        status: e.status || '',
        category: e.category || '',
        imageUrl: e.imageUrl || '',
      }))

      setEvents(mappedEvents)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load outreach events')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = (eventId: string) => {
    if (registrations.includes(eventId)) {
      toast.error('Already registered')
      return
    }

    setRegistrations(prev => [...prev, eventId])
    setEvents(prev =>
      prev.map(e =>
        e._id === eventId
          ? { ...e, currentRegistrations: e.currentRegistrations + 1 }
          : e
      )
    )

    toast.success('Registered successfully!')
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      !selectedCategory || event.category === selectedCategory

    const matchesDate =
      !selectedDate ||
      !event.eventDate ||
      new Date(event.eventDate).toDateString() ===
        new Date(selectedDate).toDateString()

    return matchesSearch && matchesCategory && matchesDate
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Outreach Events</h1>
          <p className="text-gray-600">
            Explore exciting events happening outside campus
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search outreach events..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              >
                <option value="">All Types</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>

          </div>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => (
              <EventCard
                key={event._id}
                event={event}
                onRegister={handleRegister}
                isRegistered={registrations.includes(event._id)}
                showRegisterButton
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No outreach events found</h3>
          </div>
        )}

      </div>
    </div>
  )
}

export default Outreach
