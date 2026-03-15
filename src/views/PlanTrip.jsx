export default function PlanTrip({ profile, trips, onAdd, onClose }) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center p-6">
        <h1 className="text-xl font-bold mb-4">Plan a Trip</h1>
        <p className="text-gray-500 mb-4">Calendar coming soon</p>
        <button onClick={onClose} className="bg-purple-600 text-white px-4 py-2 rounded-lg">Close</button>
      </div>
    </div>
  )
}
