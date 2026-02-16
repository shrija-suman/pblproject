import React from 'react'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import { format } from 'date-fns'

export interface Event {
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

interface EventCardProps {
  event: Event
  onRegister?: (eventId: string) => void
  showRegisterButton?: boolean
  isRegistered?: boolean
}

const EventCard: React.FC<EventCardProps> = (props) => {
  const { event, onRegister, showRegisterButton = true, isRegistered = false } = props

  const spotsLeft = event.registrationLimit - event.currentRegistrations
  const isFullyBooked = spotsLeft <= 0
  const eventDate = new Date(event.eventDate)

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      academic: 'bg-blue-100 text-blue-800',
      sports: 'bg-green-100 text-green-800',
      cultural: 'bg-purple-100 text-purple-800',
      technical: 'bg-orange-100 text-orange-800',
      social: 'bg-pink-100 text-pink-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden 
                 hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out"
    >
      <div className="relative">
        <img
          src={event.imageUrl || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg'}
          alt={event.title}
          className="w-full h-48 object-cover transition-transform duration-300 ease-in-out hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex space-x-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}
          >
            {event.category}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}
          >
            {event.status}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 transition-colors duration-300 hover:text-[#FF9BC6]">
          {event.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2" />
            <span>{format(eventDate, 'PPP p')}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-2" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users size={16} className="mr-2" />
            <span>{event.currentRegistrations} / {event.registrationLimit} registered</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2" />
            <span className={spotsLeft <= 5 ? 'text-red-600 font-medium' : undefined}>
              {spotsLeft} spots left
            </span>
          </div>
        </div>

        {showRegisterButton && event.status === 'approved' && (
          <div className="flex justify-between items-center">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#FFB6E0] h-2 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${(event.currentRegistrations / event.registrationLimit) * 100}%` }}
              />
            </div>
            <button
              onClick={() => onRegister?.(event._id)}
              disabled={isFullyBooked || isRegistered}
              className={`ml-4 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 
            ${isRegistered
              ? 'bg-[#95C450] text-white cursor-not-allowed'
              : isFullyBooked
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-[#FFB6E0] text-white hover:bg-[#FF9BC6] active:bg-[#D5AEEB] hover:scale-105 active:scale-95'
            }`}

            >
              {isRegistered ? 'Registered' : isFullyBooked ? 'Full' : 'Register'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventCard
