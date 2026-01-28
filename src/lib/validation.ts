export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email || !email.trim()) {
    return { isValid: false, message: 'Email address is required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address.' };
  }

  return { isValid: true };
}

export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone || !phone.trim()) {
    return { isValid: false, message: 'Phone number is required.' };
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's a valid US phone number (10 digits, optionally with country code)
  if (cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'))) {
    return { isValid: true };
  }

  return { isValid: false, message: 'Please enter a valid phone number (10 digits, US format).' };
}

export function validateAge(age: number): ValidationResult {
  if (!age || age < 6) {
    return { isValid: false, message: 'Students must be at least 6 years old.' };
  }

  if (age > 120) {
    return { isValid: false, message: 'Please enter a valid age.' };
  }

  return { isValid: true };
}

export function validateLessonTime(timeString: string): ValidationResult {
  if (!timeString || !timeString.trim()) {
    return { isValid: false, message: 'Lesson time is required.' };
  }

  let hours: number;
  let minutes: number;
  
  if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
    // Handle 12-hour format with AM/PM
    const parts = timeString.split(':');
    hours = parseInt(parts[0]);
    minutes = parseInt(parts[1]?.split(' ')[0] || '0');
    
    const ampm = timeString.toLowerCase().includes('pm') ? 'pm' : 'am';
    
    // Convert to 24-hour format
    if (ampm === 'pm' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'am' && hours === 12) {
      hours = 0;
    }
  } else {
    // Handle 24-hour format
    const parts = timeString.split(':');
    hours = parseInt(parts[0]);
    minutes = parseInt(parts[1] || '0');
  }
  
  // Check if time is between 9 AM and 6 PM
  const totalMinutes = hours * 60 + minutes;
  const nineAM = 9 * 60; // 9:00 AM
  const sixPM = 18 * 60; // 6:00 PM
  
  if (totalMinutes < nineAM || totalMinutes > sixPM) {
    return { isValid: false, message: 'Lesson time must be between 9 AM and 6 PM.' };
  }

  return { isValid: true };
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || !value.trim()) {
    return { isValid: false, message: `${fieldName} is required.` };
  }

  return { isValid: true };
}

export function validateStartDate(startDate: string): ValidationResult {
  if (!startDate || !startDate.trim()) {
    return { isValid: false, message: 'Preferred start date is required.' };
  }

  let selectedDate: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    const parts = startDate.split('-').map((p) => parseInt(p, 10));
    selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
  } else {
    selectedDate = new Date(startDate);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison

  if (selectedDate < today) {
    return { isValid: false, message: 'Preferred start date cannot be in the past.' };
  }

  return { isValid: true };
}

export function validateStudentData(data: {
  studentName: string;
  phoneNumber: string;
  emailAddress: string;
  age: number;
  lessonDay: string;
  lessonTime: string;
  duration: string;
  skillLevel: string;
  startDate: string;
}, allowPastDates: boolean = false): ValidationResult {
  // Validate required fields
  const nameValidation = validateRequired(data.studentName, 'Student name');
  if (!nameValidation.isValid) return nameValidation;

  const phoneValidation = validatePhoneNumber(data.phoneNumber);
  if (!phoneValidation.isValid) return phoneValidation;

  const emailValidation = validateEmail(data.emailAddress);
  if (!emailValidation.isValid) return emailValidation;

  const ageValidation = validateAge(data.age);
  if (!ageValidation.isValid) return ageValidation;

  const lessonDayValidation = validateRequired(data.lessonDay, 'Preferred lesson day');
  if (!lessonDayValidation.isValid) return lessonDayValidation;

  const lessonTimeValidation = validateLessonTime(data.lessonTime);
  if (!lessonTimeValidation.isValid) return lessonTimeValidation;

  const durationValidation = validateRequired(data.duration, 'Lesson duration');
  if (!durationValidation.isValid) return durationValidation;

  const skillLevelValidation = validateRequired(data.skillLevel, 'Skill level');
  if (!skillLevelValidation.isValid) return skillLevelValidation;

  if (!allowPastDates) {
    const startDateValidation = validateStartDate(data.startDate);
    if (!startDateValidation.isValid) return startDateValidation;
  }

  return { isValid: true };
}