import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, Star, User } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { format } from "date-fns"
import toast from "react-hot-toast"

/* ================= TYPES ================= */

interface Registration {
  _id: string
  userId: string
  eventId: string
  registeredAt: string
  status: string
  notes: string
}

interface Event {
  _id: string
  title: string
  description: string
  eventDate: string
  venue: string
  category: string
  imageUrl?: string
}

interface Feedback {
  _id: string
  userId: string
  eventId: string
  rating: number
  comment: string
  submittedAt: string
}

// ✅ Full user type
interface UserType {
  userId: string
  userName: string
  email: string
}

/* ================= COMPONENT ================= */

const Profile = () => {
  const { user, isAuthenticated, signIn } = useAuth()

  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [events, setEvents] = useState<Record<string, Event>>({})
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] =
    useState<"events" | "feedback" | "settings">("events")

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  /* ================= FETCH DATA ================= */

  const fetchUserData = async () => {
    if (!user) return

    try {
      setLoading(true)

      const registrationsModule = await import("../entities/registrations.json")
      const eventsModule = await import("../entities/events.json")
      const feedbackModule = await import("../entities/feedback.json")

      const registrationsData: Registration[] =
        registrationsModule.default || registrationsModule
      const eventsData: Event[] = eventsModule.default || eventsModule
      const feedbackData: Feedback[] = feedbackModule.default || feedbackModule

      const userRegistrations = registrationsData.filter(
        (r) => r.userId === user.userId
      )
      setRegistrations(userRegistrations)

      const eventsMap: Record<string, Event> = {}
      eventsData.forEach((event) => {
        eventsMap[event._id] = event
      })
      setEvents(eventsMap)

      const userFeedback = feedbackData.filter(
        (f) => f.userId === user.userId
      )
      setFeedback(userFeedback)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  /* ================= CANCEL ================= */

  const cancelRegistration = (registrationId: string) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r._id === registrationId ? { ...r, status: "cancelled" } : r
      )
    )
    toast.success("Registration cancelled")
  }

  /* ================= AUTH CHECK ================= */

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your profile.
          </p>
          <button
            onClick={signIn}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  /* ================= FILTER EVENTS ================= */

  const upcomingEvents = registrations.filter((reg) => {
    const event = events[reg.eventId]
    return event && new Date(event.eventDate) > new Date() && reg.status === "registered"
  })

  const pastEvents = registrations.filter((reg) => {
    const event = events[reg.eventId]
    return event && new Date(event.eventDate) <= new Date() && reg.status === "registered"
  })

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* HEADER */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 rounded-full p-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.userName}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white rounded-lg shadow-md">

          {/* TAB BUTTONS */}
          <div className="border-b px-6 flex space-x-6">
            {["events","feedback","settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "events" | "feedback" | "settings")}
                className={`py-4 border-b-2 ${
                  activeTab===tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* EVENTS TAB */}
            {activeTab==="events" && (
              <>
                <h3 className="text-lg font-semibold mb-4">
                  Upcoming Events ({upcomingEvents.length})
                </h3>

                {upcomingEvents.map(reg=>{
                  const event = events[reg.eventId]
                  if(!event) return null

                  return(
                    <div key={reg._id} className="border rounded-lg p-4 mb-4">
                      <h4 className="font-semibold">{event.title}</h4>

                      <div className="text-sm text-gray-600 mt-1 flex items-center">
                        <Calendar size={14} className="mr-1"/>
                        {format(new Date(event.eventDate),"PPP p")}
                      </div>

                      <div className="text-sm text-gray-600 mt-1 flex items-center">
                        <MapPin size={14} className="mr-1"/>
                        {event.venue}
                      </div>

                      <button
                        onClick={()=>cancelRegistration(reg._id)}
                        className="mt-3 text-red-600 text-sm"
                      >
                        Cancel Registration
                      </button>
                    </div>
                  )
                })}
              </>
            )}

            {/* FEEDBACK TAB */}
            {activeTab==="feedback" && (
              <>
                <h3 className="text-lg font-semibold mb-4">
                  My Feedback ({feedback.length})
                </h3>

                {feedback.map(f=>{
                  const event = events[f.eventId]

                  return(
                    <div key={f._id} className="border rounded-lg p-4 mb-4">
                      <h4 className="font-semibold">{event?.title}</h4>

                      <div className="flex mt-1">
                        {[...Array(5)].map((_,i)=>(
                          <Star
                            key={i}
                            size={16}
                            className={i<f.rating?"text-yellow-400":"text-gray-300"}
                          />
                        ))}
                      </div>

                      <p className="text-sm mt-2">{f.comment}</p>

                      <div className="text-xs text-gray-500 mt-2 flex items-center">
                        <Clock size={12} className="mr-1"/>
                        {format(new Date(f.submittedAt),"PPP")}
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {/* SETTINGS TAB */}
            {activeTab==="settings" && (
              <div className="space-y-4">
                <p><b>Name:</b> {user.userName}</p>
                <p><b>Email:</b> {user.email}</p>
                <p><b>ID:</b> {user.userId}</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
