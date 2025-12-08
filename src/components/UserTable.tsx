import { useState, useEffect, useMemo } from 'react'

type User = {
  id: number
  name: string
  email: string
  phone: string
  website: string
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: User[] = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  // Фильтруем пользователей при изменении searchTerm
  const filteredUsers = useMemo(() => {
    if (searchTerm.length < 3) {
      return users
    }
    
    const term = searchTerm.toLowerCase()
    return users.filter(user => 
      user.email.toLowerCase().includes(term)
    )
  }, [users, searchTerm])

  return (
    <div className="user-table-container">
      <button onClick={fetchUsers} disabled={loading}>
        {loading ? 'Загрузка...' : 'Загрузить пользователей'}
      </button>

      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: 'red' }}>Ошибка при загрузке: {error}</p>}

      {!loading && !error && users.length > 0 && (
        <>
          <div style={{ marginTop: '20px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Поиск по email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px',
                width: '300px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            {searchTerm.length > 0 && searchTerm.length < 3 && (
              <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                Введите минимум 3 символа для поиска
              </p>
            )}
          </div>

          {filteredUsers.length === 0 ? (
            <p style={{ marginTop: '20px' }}>
              {searchTerm.length >= 3 ? 'Ничего не найдено' : 'Нет данных для отображения'}
            </p>
          ) : (
            <table
              border={1}
              style={{ marginTop: '10px', borderCollapse: 'collapse', width: '100%' }}
            >
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Сайт</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <a 
                        href={`http://${user.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {user.website}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  )
}