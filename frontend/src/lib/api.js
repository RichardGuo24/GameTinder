import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No active session');
  }
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
}

export async function getNextRecommendation() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/recommendation/next`, {
    headers
  });
  if (!response.ok) {
    throw new Error('Failed to fetch recommendation');
  }
  return response.json();
}

export async function recordSwipe(gameId, decision) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/swipes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ gameId, decision })
  });
  if (!response.ok) {
    throw new Error('Failed to record swipe');
  }
  return response.json();
}

export async function createSession(gameId) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ gameId })
  });
  if (!response.ok) {
    throw new Error('Failed to create session');
  }
  return response.json();
}

export async function getSession(sessionId) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
    headers
  });
  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }
  return response.json();
}

export async function startSession(sessionId) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/start`, {
    method: 'PATCH',
    headers
  });
  if (!response.ok) {
    throw new Error('Failed to start session');
  }
  return response.json();
}

export async function endSession(sessionId) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/end`, {
    method: 'PATCH',
    headers
  });
  if (!response.ok) {
    throw new Error('Failed to end session');
  }
  return response.json();
}

export async function rateSession(sessionId, rating) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/rating`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(rating)
  });
  if (!response.ok) {
    throw new Error('Failed to rate session');
  }
  return response.json();
}

export async function getDashboard() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
    headers
  });
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  return response.json();
}
