import { useState, useEffect } from "react"
import { Calendar, Users, TrendingUp, XCircle, Clock, BarChart3 } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { format } from "date-fns"
import toast from "react-hot-toast"

interface Event {
  _id: string
  title: string
  description: string
  eventDate: string
  venue: string
  organizerId: string
  clubId: string
  registrationLimit: number
  currentRegistrations: number
  status: string
  category: string
  createdAt: string
}

interface Club {
  _id: string
  name: string
  description: string
  presidentId: string
  memberCount: number
  isActive: boolean
}

interface Registration {
  _id: string
  userId: string
  eventId: string
  registeredAt: string
  status: string
}

const Admin = () => {
  const { isAuthenticated, userRole } = useAuth()

  const [events, setEvents] = useState<Event[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"dashboard" | "events" | "clubs">("dashboard")

  useEffect(() => {
    if (isAuthenticated && userRole === "ADMIN") {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, userRole])

  const fetchData = async () => {
    try {
      setLoading(true)

      const eventsModule = await import("../entities/events.json")
      const clubsModule = await import("../entities/clubs.json")
      const registrationsModule = await import("../entities/registrations.json")

      setEvents((eventsModule.default || []) as Event[])
      setClubs(clubsModule.default || [])
      setRegistrations(registrationsModule.default || [])

    } catch (error) {
      console.error("Failed to fetch admin data:", error)
      toast.error("Failed to load admin data")
    } finally {
      setLoading(false)
    }
  }

  const updateEventStatus = (eventId: string, status: "approved" | "rejected") => {
    setEvents(prev =>
      prev.map(event =>
        event._id === eventId ? { ...event, status } : event
      )
    )
    toast.success(`Event ${status} successfully`)
  }

  const toggleClubStatus = (clubId: string, isActive: boolean) => {
    setClubs(prev =>
      prev.map(club =>
        club._id === clubId ? { ...club, isActive } : club
      )
    )
    toast.success(`Club ${isActive ? "activated" : "deactivated"} successfully`)
  }

  if (!isAuthenticated || userRole !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to administrators.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const pendingEvents = events.filter(event => event.status === "pending")
  const activeClubs = clubs.filter(club => club.isActive)
  const totalRegistrations = registrations.length

  const stats = [
    { label: "Total Events", value: events.length, icon: Calendar, color: "blue" },
    { label: "Active Clubs", value: activeClubs.length, icon: Users, color: "green" },
    { label: "Total Registrations", value: totalRegistrations, icon: TrendingUp, color: "purple" },
    { label: "Pending Approvals", value: pendingEvents.length, icon: Clock, color: "yellow" }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-gray-600">Manage campus events, clubs, and system overview</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">

          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {["dashboard", "events", "clubs"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "dashboard" && <BarChart3 className="inline w-4 h-4 mr-2" />}
                  {tab === "events" && <Calendar className="inline w-4 h-4 mr-2" />}
                  {tab === "clubs" && <Users className="inline w-4 h-4 mr-2" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">

            {/* Dashboard */}
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => {
                  const Icon = stat.icon
                  return (
                    <div key={i} className="bg-white rounded-lg shadow-md p-6 flex items-center">
                      <Icon className="h-8 w-8 mr-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-xl font-bold">{stat.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Events */}
            {activeTab === "events" && (
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event._id} className="border rounded-lg p-4">
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(event.eventDate), "PPP")}
                    </p>

                    {event.status === "pending" && (
                      <div className="space-x-2 mt-2">
                        <button
                          onClick={() => updateEventStatus(event._id, "approved")}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateEventStatus(event._id, "rejected")}
                          className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Clubs */}
            {activeTab === "clubs" && (
              <div className="space-y-4">
                {clubs.map(club => (
                  <div key={club._id} className="border rounded-lg p-4">
                    <h4 className="font-semibold">{club.name}</h4>
                    <p className="text-sm text-gray-600">{club.description}</p>
                    <p className="text-sm text-gray-500">{club.memberCount} members</p>

                    <button
                      onClick={() => toggleClubStatus(club._id, !club.isActive)}
                      className="mt-2 px-3 py-1 rounded bg-blue-600 text-white"
                    >
                      {club.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
