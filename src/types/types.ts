// Lodge/Room Types
export interface Lodge {
  id: number;
  name: string | null;
  max_capacity: number;
  lodge_type_id: number;
  key_owner: number | null;
}

export interface LodgeWithOccupation {
  id: number;
  name: string | null;
  max_capacity: number;
  lodge_type_id: number;
  key_owner: number | null;
  occupation: number;
  key_owner_name: string | null;
  lodge_type_name: string | null;
}

export interface LodgeDetail {
  id: number;
  name: string | null;
  max_capacity: number;
  lodge_type_id: number;
  lodge_type_name: string | null;
  key_owner: number | null;
  key_owner_name: string | null;
  occupation: number;
  participants: Profile[];
}

export interface LodgeType {
  id: number;
  type: string;
}

// Room Status Type (for frontend display)
export type RoomStatus = 'Disponível' | 'Cheio';

export interface Room {
  id: string;
  occupation: number;
  capacity: number;
  name: string;
  keyOwner: string;
  status: RoomStatus;
}

// Profile Types
export interface Profile {
  id: number;
  name: string;
  slug: string;
  age: number;
  district: string;
  instagram: string | null;
  role_id: number;
  lodge_id: number | null;
  type_subscription: string | null;
  is_paid: boolean;
  team_color: string | null;
  team_hex: string | null;
  checked_in: boolean;
  cellphone?: string | null;
}

export interface ProfileQRCode {
  profile_id: number;
  qr_code_url: string;
  qr_code_image_base64: string | null;
}

export interface ProfileSearch {
  name: string | null;
  district: string | null;
  role_id: number | null;
  lodge_id: number | null;
}

// Frontend-specific Profile with display fields
export interface ProfileDisplay {
  id: string;
  name: string;
  instagram: string;
  qrCodeContent: string;
  teamName: string;
  teamHexColor: string;
  roomName: Room['name'] | 'Sem quarto';
  roomKeyOwner: Room['keyOwner'] | 'Sem proprietário';
  photo: string;
  district: string;
}

// User Types
export interface User {
  id: number;
  email: string;
  cellphone: string;
  event_id: number;
}

export interface UserList {
  users: User[];
}

export interface UserWithProfile extends User {
  profile: Profile | null;
  next_team_color: string | null;
  next_team_hex: string | null;
}

export interface UserPasswordChange {
  current_password: string;
  new_password: string;
}

// Auth Types
export interface Token {
  access_token: string;
  token_type: string;
}

export interface Login {
  email: string;
  password: string;
}

// Lecture/Workshop Types
export interface Lecture {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_workshop: boolean;
  speaker_id: number;
  event_id: number;
  max_capacity: number | null;
}

export interface LectureWithOccupation extends Lecture {
  occupancy: number;
  speaker_name?: string;
}

export interface LectureDetail extends LectureWithOccupation {
  participants: Profile[];
}

export interface Presence {
  id: number;
  profile_id: number;
  lecture_id: number;
  register_id: number;
  date: string;
}

export interface Workshop {
  id: string;
  title: string;
  description?: string;
  hour: string;
  location: string;
}

// Event Types
export interface Event {
  id: number;
  year: string;
  adress: string;
}

// Role Types
export interface Role {
  id: number;
  type: string;
}

// Presence Types
export interface Presence {
  id: number;
  profile_id: number;
  lecture_id: number;
  register_id: number;
  date: string;
}

// Common Types
export interface Message {
  message: string;
}

export interface Pagination {
  offset: number;
  limit: number;
}
