import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('/api/test')
      .then(response => response.text())
      .then(data => setMessage(data))
      .catch(error => {
        console.error('Backend connection failed:', error)
        setMessage('Backend connection failed')
      })
  }, [])
  return (
    <div>
      <h1>Consultancy Management System</h1>
      <h3>This is a proxy Api</h3>
      <p>Backend response:</p>
      <strong>{message}</strong>
    </div>
  )
}
export default App