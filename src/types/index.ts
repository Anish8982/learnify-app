export interface User {
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  enrolledCourses?: number;
  progress?: number;
}

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Course {
  id: string | number;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  instructorAvatar?: string;
  price?: number;
  originalPrice?: number; // raw USD price for level derivation
  duration?: string;
  rating?: number;
  level?: CourseLevel;
  category?: string;
  isBookmarked?: boolean;
}

export interface LastOpenedCourse {
  id: string | number;
  title: string;
  thumbnail: string;
  instructor: string;
  progress: number;
}

// Raw shapes from the API
export interface RawProduct {
  id: number;
  title: string;
  description: string;
  images: string[];
  thumbnail?: string;
  price: number;
  brand?: string;
  category?: string;
  rating?: number;
  stock?: number;
}

export interface RawUser {
  login: { uuid: string };
  name: { first: string; last: string };
  picture: { medium: string; large: string };
  email?: string;
  location?: { city: string; country: string };
}
