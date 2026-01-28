'use client';

import { useState, useEffect, useCallback } from 'react';
import Button from './Button';
import Modal from './Modal';
import { useToast } from './ToastContext';
import { convertTo24Hour } from '../lib/time-utils';
import { SuggestionType } from '../models/suggestion';

interface Suggestion {
  day?: string;
  time?: string;
}

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (day: string, time: string) => void;
  duration: string;
  dayOfWeek?: string;
  lessonTime?: string;
}

export default function SuggestionModal({
  isOpen,
  onClose,
  onSelect,
  duration,
  dayOfWeek,
  lessonTime
}: SuggestionModalProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSuggest = useCallback(async () => {
    let suggestType = SuggestionType.BOTH;
    if (lessonTime && duration) {
      suggestType = SuggestionType.DAY;
    } else if (dayOfWeek && duration) {
      suggestType = SuggestionType.TIME;
    } else if (duration) {
      suggestType = SuggestionType.BOTH;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        duration,
        suggest: suggestType,
      });
      if (suggestType === SuggestionType.TIME) {
        params.set('dayOfWeek', dayOfWeek!);
      }
      const res = await fetch(`/api/piano/suggest-time?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions);
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to suggest time', 'error');
        onClose();
      }
    } catch (error) {
      console.error('Error suggesting time:', error);
      showToast('Failed to suggest time', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [duration, dayOfWeek, lessonTime, showToast, onClose]);

  useEffect(() => {
    if (isOpen && duration) {
      handleSuggest();
    } else if (!isOpen) {
      // Reset suggestions when modal closes
      setSuggestions([]);
    }
  }, [isOpen, duration, dayOfWeek, lessonTime, handleSuggest]);

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    const day = suggestion.day || '';
    const time = suggestion.time ? convertTo24Hour(suggestion.time) : '';
    onSelect(day, time);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {suggestions.length > 0 && suggestions[0].day && suggestions[0].time ? 'Suggested Lesson Times' :
         suggestions.length > 0 && suggestions[0].day ? 'Suggested Lesson Days' :
         'Suggested Lesson Times'}
      </h3>
      <p className="text-foreground/70 mb-6">
        {suggestions.length > 0 && suggestions[0].day && suggestions[0].time ? 'Here are some available times based on your selected duration:' :
         suggestions.length > 0 && suggestions[0].day ? 'Here are some available days based on your selected duration:' :
         'Here are some available times based on your selected duration:'}
      </p>
      <div className="space-y-3 mb-6">
        {loading ? (
          // Loading placeholders
          [0, 1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex-1">
                <div className="h-4 w-20 bg-blue-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 w-16 bg-blue-200 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-16 bg-blue-300 rounded animate-pulse"></div>
          </div>
        ))
        ) : suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">
                {suggestion.day && suggestion.time ? `${suggestion.day} at ${suggestion.time}` :
                 suggestion.day || suggestion.time}
              </p>
              <Button
                onClick={() => handleSelectSuggestion(suggestion)}
                variant="primary"
                size="sm"
              >
                Fill for Me
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-foreground/70">No suggestions found for the selected criteria.</p>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onClose}
          variant="secondary"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}