import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import UserTable from './UserTable'

// Мокаем глобальный fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('UserTable Component с поиском', () => {
  const mockUsers = [
    {
      id: 1,
      name: 'Leanne Graham',
      email: 'Sincere@april.biz',
      phone: '1-770-736-8031 x56442',
      website: 'hildegard.org'
    },
    {
      id: 2,
      name: 'Ervin Howell',
      email: 'Shanna@melissa.tv',
      phone: '010-692-6593 x09125',
      website: 'anastasia.net'
    },
    {
      id: 3,
      name: 'Clementine Bauch',
      email: 'Nathan@yesenia.net',
      phone: '1-463-123-4447',
      website: 'ramiro.info'
    }
  ]

  beforeEach(() => {
    mockFetch.mockClear()
  })

  test('отображает поле поиска по email после загрузки данных', async () => {
    render(<UserTable />)
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    })

    fireEvent.click(screen.getByText('Загрузить пользователей'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Поиск по email')).toBeInTheDocument()
    })
  })

  test('не отображает поле поиска до загрузки данных', () => {
    render(<UserTable />)
    
    expect(screen.queryByPlaceholderText('Поиск по email')).not.toBeInTheDocument()
  })

  test('фильтрует пользователей по email при вводе 3+ символов', async () => {
    render(<UserTable />)
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    })

    fireEvent.click(screen.getByText('Загрузить пользователей'))

    await waitFor(() => {
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
      expect(screen.getByText('Ervin Howell')).toBeInTheDocument()
      expect(screen.getByText('Clementine Bauch')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Поиск по email')
    
    // Вводим "ap" - должно отображаться сообщение о необходимости 3 символов
    fireEvent.change(searchInput, { target: { value: 'ap' } })
    
    // Проверяем, что все пользователи все еще отображаются
    expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    expect(screen.getByText('Ervin Howell')).toBeInTheDocument()
    expect(screen.getByText('Clementine Bauch')).toBeInTheDocument()
    
    // Вводим "april" (5 символов) - должен отфильтроваться только первый пользователь
    fireEvent.change(searchInput, { target: { value: 'april' } })
    
    await waitFor(() => {
      // Должен остаться только пользователь с email содержащим "april"
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
      expect(screen.queryByText('Ervin Howell')).not.toBeInTheDocument()
      expect(screen.queryByText('Clementine Bauch')).not.toBeInTheDocument()
    })
  })

  test('поиск регистронезависимый', async () => {
    render(<UserTable />)
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    })

    fireEvent.click(screen.getByText('Загрузить пользователей'))

    await waitFor(() => {
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Поиск по email')
    
    // Проверяем поиск с разным регистром
    fireEvent.change(searchInput, { target: { value: 'APRIL' } }) // заглавные
    
    await waitFor(() => {
      // Должен найти даже при вводе заглавными
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
      expect(screen.queryByText('Ervin Howell')).not.toBeInTheDocument()
    })

    // Меняем на строчные
    fireEvent.change(searchInput, { target: { value: 'april' } }) // строчные
    
    await waitFor(() => {
      // Должен найти и при строчных
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    })
  })

  test('показывает сообщение "Ничего не найдено" при отсутствии результатов', async () => {
    render(<UserTable />)
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    })

    fireEvent.click(screen.getByText('Загрузить пользователей'))

    await waitFor(() => {
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Поиск по email')
    
    // Вводим несуществующий email
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    
    await waitFor(() => {
      expect(screen.getByText('Ничего не найдено')).toBeInTheDocument()
      expect(screen.queryByText('Leanne Graham')).not.toBeInTheDocument()
    })
  })

  test('показывает сообщение о необходимости 3 символов при вводе менее 3 символов', async () => {
    render(<UserTable />)
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    })

    fireEvent.click(screen.getByText('Загрузить пользователей'))

    await waitFor(() => {
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Поиск по email')
    
    // Вводим 2 символа
    fireEvent.change(searchInput, { target: { value: 'ap' } })
    
    // Должно появиться сообщение о необходимости 3 символов
    expect(screen.getByText('Введите минимум 3 символа для поиска')).toBeInTheDocument()
    
    // Все пользователи должны остаться
    expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    expect(screen.getByText('Ervin Howell')).toBeInTheDocument()
    expect(screen.getByText('Clementine Bauch')).toBeInTheDocument()
    
    // Вводим 3 символа - сообщение должно исчезнуть
    fireEvent.change(searchInput, { target: { value: 'apr' } })
    
    expect(screen.queryByText('Введите минимум 3 символа для поиска')).not.toBeInTheDocument()
  })

  test('возвращает всех пользователей при очистке поля поиска', async () => {
    render(<UserTable />)
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    })

    fireEvent.click(screen.getByText('Загрузить пользователей'))

    await waitFor(() => {
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Поиск по email')
    
    // Фильтруем
    fireEvent.change(searchInput, { target: { value: 'april' } })
    
    await waitFor(() => {
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
      expect(screen.queryByText('Ervin Howell')).not.toBeInTheDocument()
    })
    
    // Очищаем поле поиска
    fireEvent.change(searchInput, { target: { value: '' } })
    
    await waitFor(() => {
      // Все пользователи должны вернуться
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
      expect(screen.getByText('Ervin Howell')).toBeInTheDocument()
      expect(screen.getByText('Clementine Bauch')).toBeInTheDocument()
    })
  })

  test('ввод "ap" и проверка фильтрации (специфичный тест)', async () => {
    render(<UserTable />)
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    })

    fireEvent.click(screen.getByText('Загрузить пользователей'))

    await waitFor(() => {
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Поиск по email')
    
    // Вводим "ap" (2 символа) - фильтрации не должно быть
    fireEvent.change(searchInput, { target: { value: 'ap' } })
    
    // Проверяем, что все пользователи остаются
    expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    expect(screen.getByText('Ervin Howell')).toBeInTheDocument()
    expect(screen.getByText('Clementine Bauch')).toBeInTheDocument()
    
    // Вводим "apr" (3 символа) - должна начаться фильтрация
    fireEvent.change(searchInput, { target: { value: 'apr' } })
    
    await waitFor(() => {
      // Должен остаться только пользователь с "april" в email
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
      expect(screen.queryByText('Ervin Howell')).not.toBeInTheDocument()
      expect(screen.queryByText('Clementine Bauch')).not.toBeInTheDocument()
    })
  })

  test('фильтрация работает корректно при частичном совпадении', async () => {
    render(<UserTable />)
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    })

    fireEvent.click(screen.getByText('Загрузить пользователей'))

    await waitFor(() => {
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Поиск по email')
    
    // Ищем по части email
    fireEvent.change(searchInput, { target: { value: 'melissa' } })
    
    await waitFor(() => {
      // Должен найти только второго пользователя
      expect(screen.queryByText('Leanne Graham')).not.toBeInTheDocument()
      expect(screen.getByText('Ervin Howell')).toBeInTheDocument()
      expect(screen.queryByText('Clementine Bauch')).not.toBeInTheDocument()
    })
  })
})