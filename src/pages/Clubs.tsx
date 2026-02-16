import { useState, useEffect } from "react"
import { Users, Calendar, Search } from "lucide-react"
import toast from "react-hot-toast"

interface Club {
  _id: string
  name: string
  description: string
  presidentId: string
  memberCount: number
  logoUrl?: string
  isActive: boolean
}

interface Event {
  _id: string
  title: string
  eventDate: string
  venue: string
  status: string
  category: string
  clubId: string
}

const Clubs = () => {
  const [clubs, setClubs] = useState<Club[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClub, setSelectedClub] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch clubs and events from backend
      const [clubsRes, eventsRes] = await Promise.all([
        fetch("http://localhost:5000/api/clubs"),
        fetch("http://localhost:5000/api/events"),
      ])
      if (!clubsRes.ok || !eventsRes.ok) throw new Error()
      const clubsData: Club[] = await clubsRes.json()
      const eventsData: Event[] = await eventsRes.json()

      const activeClubs = clubsData
        .filter(club => club.isActive)
        .sort((a, b) => b.memberCount - a.memberCount)

      const approvedEvents = eventsData
        .filter(event => event.status === "approved")
        .sort(
          (a, b) =>
            new Date(a.eventDate).getTime() -
            new Date(b.eventDate).getTime()
        )

      setClubs(activeClubs)
      setEvents(approvedEvents)

    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load clubs or events")
    } finally {
      setLoading(false)
    }
  }

  /* SEARCH FILTER */
  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  /* GET EVENTS OF CLUB */
  const getClubEvents = (clubId: string) => {
    return events.filter(event => event.clubId === clubId)
  }

  /* LOADING SCREEN */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Campus Clubs</h1>
          <p className="text-gray-600">Explore active clubs and their upcoming events</p>
        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search clubs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* CLUB GRID */}
        {filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {filteredClubs.map(club => {
              const clubEvents = getClubEvents(club._id)
              const upcomingEvents = clubEvents.filter(e => new Date(e.eventDate) > new Date())

              return (
                <div key={club._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">

                  {/* IMAGE */}
                  <div className="relative">
                    <img
                      src={club.logoUrl || "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg"}
                      alt={club.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg px-3 py-1">
                      <div className="flex items-center text-sm">
                        <Users size={14} className="mr-1 text-gray-600" />
                        {club.memberCount} members
                      </div>
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{club.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{club.description}</p>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Calendar size={14} className="mr-1" />
                      {upcomingEvents.length} upcoming events
                    </div>

                    

                    <button
                      onClick={() =>
                        setSelectedClub(selectedClub === club._id ? null : club._id)
                      }
                      className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                      {selectedClub === club._id ? "Hide Details" : "View Details"}
                    </button>
                  </div>

                  {/* EXPANDED SECTION */}
                  {selectedClub === club._id && (
                    <div className="border-t bg-gray-50 p-6">
                      <h4 className="font-semibold mb-3">All Events by {club.name}</h4>
                      {clubEvents.length > 0 ? (
                        <div className="space-y-3">
                          {clubEvents.map(event => (
                            <div key={event._id} className="bg-white rounded-lg p-4 shadow-sm">
                              <h5 className="font-medium">{event.title}</h5>
                              <div className="text-sm text-gray-600 mt-1">
                                {new Date(event.eventDate).toLocaleDateString()} • {event.venue}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No events scheduled yet.</p>
                      )}
                    </div>
                  )}

                </div>
              )
            })}

          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No clubs found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try another search." : "No active clubs yet."}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

export default Clubs
