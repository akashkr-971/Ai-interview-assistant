import React from 'react'

const card = () => {
  return (
    <div className="border p-4 rounded shadow-md">
      <h2 className="text-lg font-bold">Card Title</h2>
      <p className="text-gray-700">This is a description of the card.</p>
      <button className="mt-4 bg-blue-500 text-white rounded p-2 hover:bg-blue-600">Action</button>
    </div>
  )
}

export default card