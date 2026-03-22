import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({}, null, 2));
  }
}

function readUsers(): Record<string, unknown> {
  ensureDataDir();
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeUsers(data: Record<string, unknown>) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// GET — load user data by phone number
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone');
  if (!phone) {
    return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
  }

  const users = readUsers();
  const userData = users[phone] || null;
  return NextResponse.json({ user: userData });
}

// POST — save/update user data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, user, appliances, scheduleChoices, dailySchedule } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    const users = readUsers();
    const existing = (users[phone] || {}) as Record<string, unknown>;

    // Merge data
    users[phone] = {
      ...existing,
      user: user || existing.user,
      appliances: appliances !== undefined ? appliances : existing.appliances || [],
      scheduleChoices: scheduleChoices !== undefined ? scheduleChoices : existing.scheduleChoices || {},
      dailySchedule: dailySchedule || existing.dailySchedule || {},
      lastUpdated: new Date().toISOString(),
    };

    writeUsers(users);
    return NextResponse.json({ success: true, data: users[phone] });
  } catch {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
