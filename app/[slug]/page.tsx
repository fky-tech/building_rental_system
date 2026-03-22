import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Building2, MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function TenantSubdomainPage({ params }: { params: { slug: string } }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    profile = prof
  }

  // Find building by slug
  const { data: building } = await supabase
    .from('buildings')
    .select('*, owners(profiles(full_name, phone))')
    .eq('slug', slug)
    .single()

  if (!building) {
    notFound()
  }

  // Fetch available rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('building_id', building.id)
    .eq('status', 'available')

  return (
    <div className="min-h-screen border-t-8 border-blue-600 bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center">
                 <Building2 className="h-8 w-8 text-blue-600 mr-3" />
                 <h1 className="text-2xl font-bold text-gray-900">{building.name}</h1>
              </div>
              
              <div className="flex items-center gap-6">
                {user ? (
                  <Link 
                    href={profile?.role === 'admin' ? '/admin' : '/owner'}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link 
                    href="/login"
                    className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                  >
                    Owner Login
                  </Link>
                )}
                <div className="text-right border-l pl-6">
                   <p className="text-sm font-medium text-gray-500">Contact</p>
                   <p className="font-semibold text-gray-900">
                     {/* @ts-ignore */}
                     {building.owners?.profiles?.phone || building.owners?.profiles?.full_name || 'Contact Owner'}
                   </p>
                </div>
              </div>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
           <h2 className="text-xl font-semibold mb-2">About the Property</h2>
           <p className="text-gray-600 max-w-2xl">{building.description || 'No description available for this property.'}</p>
           <p className="text-gray-500 mt-2 flex items-center"><MapPin className="w-4 h-4 mr-1"/> {building.address}, {building.city}, {building.sub_city}</p>
        </div>

        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Available Rooms for Rent</h2>
        
        {rooms && rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
               <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize mb-2">
                          {room.room_type}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">Room {room.room_number}</h3>
                        <p className="text-sm text-gray-500">Floor {room.floor_number}</p>
                     </div>
                     <span className="text-lg font-bold text-emerald-600">${room.rent_amount}/mo</span>
                  </div>
                  <p className="text-gray-600 text-sm flex-1 mb-4">{room.description || 'No additional details provided.'}</p>
                  <button className="w-full bg-blue-600 text-white font-medium py-2 rounded flex items-center justify-center hover:bg-blue-700 transition">
                     Inquire Now
                  </button>
               </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
             <p className="text-gray-500 text-lg">No available rooms at this moment.</p>
          </div>
        )}
      </main>
    </div>
  )
}
