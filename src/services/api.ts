import type { Cap, SellerContact, UserAccount, Order } from '../types/Cap';

const AUTH_KEY = 'cap_admin';
const API_URL = '/api';

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  async login(email: string, pw: string): Promise<UserAccount | null> {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pw }),
      });
      const user = await parseResponse<UserAccount>(res);
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  },

  async register(name: string, email: string, pw: string): Promise<UserAccount | null> {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pw }),
      });
      const user = await parseResponse<UserAccount>(res);
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      return null;
    }
  },

  logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('admin_active_tab');
    localStorage.removeItem('user_active_tab');
  },

  getUser(): UserAccount | null {
    const saved = localStorage.getItem(AUTH_KEY);
    if (!saved) return null;

    try {
      return JSON.parse(saved) as UserAccount;
    } catch {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
  },

  isLoggedIn() {
    return Boolean(localStorage.getItem(AUTH_KEY));
  },

  isAdmin() {
    const user = this.getUser();
    return user?.role === 'admin';
  },

  async getAll(): Promise<Cap[]> {
    const res = await fetch(`${API_URL}/caps`);
    return parseResponse<Cap[]>(res);
  },

  async create(data: Omit<Cap, 'id'>): Promise<Cap> {
    const res = await fetch(`${API_URL}/caps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return parseResponse<Cap>(res);
  },

  async update(id: string, data: Omit<Cap, 'id'> | Partial<Cap>) {
    const res = await fetch(`${API_URL}/caps/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return parseResponse<{ success: boolean } | Cap>(res);
  },

  async remove(id: string) {
    const res = await fetch(`${API_URL}/caps/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Delete failed with status ${res.status}`);
  },

  async getContact(): Promise<SellerContact> {
    const res = await fetch(`${API_URL}/contact`);
    return parseResponse<SellerContact>(res);
  },

  async saveContact(data: SellerContact): Promise<SellerContact> {
    const res = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return parseResponse<SellerContact>(res);
  },

  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_URL}/orders`);
    return parseResponse<Order[]>(res);
  },

  async createOrder(data: Omit<Order, 'id' | 'date'>): Promise<Order> {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return parseResponse<Order>(res);
  },

  async updateOrderStatus(id: string, status: Order['status']) {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return parseResponse<{ success: boolean } | Order>(res);
  },

  async getUsers(): Promise<UserAccount[]> {
    const res = await fetch(`${API_URL}/users`);
    return parseResponse<UserAccount[]>(res);
  },
};
