export default function Home({ profile, trips, onPlanTrip, onTripsChange }) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Home</h1>
      <p className="text-gray-500 mt-2">Balance hero coming soon</p>
      <button onClick={onPlanTrip} className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg">
        Plan a Trip
      </button>
    </div>
  )
}
