// components/dashboard/types.ts

export interface CameraItem {
  id: string;
  name: string;
  type: string;
  url?: string;
  status: string;
  location?: string;
  last_active?: string;
}

export interface AlertItem {
  id: string;
  user_id: string;
  camera_id: string;
  detection_event_id?: string;
  snapshot_url?: string;
  detection_type?: string;
  confidence?: number;
  status: 'read' | 'unread';
  created_at?: string;
}
