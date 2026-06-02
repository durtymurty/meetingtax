export interface Person {
  id: string;
  name: string;
  role: string;
  salary: number;
  createdAt: string;
}

export interface Meeting {
  id: string;
  name: string;
  cost: number;
  duration: number; // seconds
  attendeeIds: string[];
  attendeeNames: string[];
  startedAt: string;
  endedAt: string;
}

export interface AnalyticsData {
  totalSpent: number;
  avgCost: number;
  totalMeetings: number;
  longestMeeting: number;
  mostExpensive: Meeting | null;
  meetings: Meeting[];
}
