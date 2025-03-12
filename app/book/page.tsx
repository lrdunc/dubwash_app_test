'use client';

import { useState } from 'react';
import { MainLayout } from '@/app/components/layout/MainLayout';
import { MOCK_WASH_TYPES, MOCK_ADD_ONS, MOCK_TIME_SLOTS } from '@/lib/constants';

type BookingStep = 'service' | 'addons' | 'time' | 'details' | 'review';

interface BookingState {
  selectedService?: typeof MOCK_WASH_TYPES[0];
  selectedAddOns: typeof MOCK_ADD_ONS[0][];
  selectedTime?: typeof MOCK_TIME_SLOTS[0];
  vehicleDetails: {
    make: string;
    model: string;
    year: string;
    color: string;
  };
  location: string;
  notes: string;
}

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [booking, setBooking] = useState<BookingState>({
    selectedAddOns: [],
    vehicleDetails: {
      make: '',
      model: '',
      year: '',
      color: ''
    },
    location: '',
    notes: ''
  });

  const steps: { id: BookingStep; title: string }[] = [
    { id: 'service', title: 'Select Service' },
    { id: 'addons', title: 'Add-ons' },
    { id: 'time', title: 'Choose Time' },
    { id: 'details', title: 'Vehicle Details' },
    { id: 'review', title: 'Review' }
  ];

  const calculateTotal = () => {
    const servicePrice = booking.selectedService?.basePrice || 0;
    const addOnsTotal = booking.selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
    return servicePrice + addOnsTotal;
  };

  const handleServiceSelect = (service: typeof MOCK_WASH_TYPES[0]) => {
    setBooking(prev => ({ ...prev, selectedService: service }));
    setCurrentStep('addons');
  };

  const handleAddOnToggle = (addon: typeof MOCK_ADD_ONS[0]) => {
    setBooking(prev => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.some(a => a.id === addon.id)
        ? prev.selectedAddOns.filter(a => a.id !== addon.id)
        : [...prev.selectedAddOns, addon]
    }));
  };

  const handleTimeSelect = (time: typeof MOCK_TIME_SLOTS[0]) => {
    setBooking(prev => ({ ...prev, selectedTime: time }));
    setCurrentStep('details');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('review');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'service':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Select Your Wash Package
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {MOCK_WASH_TYPES.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="relative flex flex-col p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex-grow">
                    {service.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${service.basePrice}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        );

      case 'addons':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Add Extra Services
              </h2>
              <button
                onClick={() => setCurrentStep('time')}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Continue
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {MOCK_ADD_ONS.map((addon) => {
                const isSelected = booking.selectedAddOns.some(a => a.id === addon.id);
                return (
                  <button
                    key={addon.id}
                    onClick={() => handleAddOnToggle(addon)}
                    className={`relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-all ${
                      isSelected
                        ? 'border-2 border-blue-500 shadow-md'
                        : 'border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {addon.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {addon.description}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${addon.price}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {addon.duration} mins
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'time':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Choose Your Preferred Time
            </h2>
            <div className="grid gap-4 md:grid-cols-4">
              {MOCK_TIME_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => slot.available && handleTimeSelect(slot)}
                  disabled={!slot.available}
                  className={`p-4 rounded-lg text-center transition-all ${
                    !slot.available
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 hover:shadow-md border-2 border-transparent hover:border-blue-500'
                  }`}
                >
                  <span className="text-lg font-medium">{slot.time}</span>
                  <span className="block text-sm mt-1">
                    {slot.available ? 'Available' : 'Booked'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'details':
        return (
          <form onSubmit={handleDetailsSubmit} className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Vehicle Details
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Make
                </label>
                <input
                  type="text"
                  required
                  value={booking.vehicleDetails.make}
                  onChange={(e) => setBooking(prev => ({
                    ...prev,
                    vehicleDetails: { ...prev.vehicleDetails, make: e.target.value }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Model
                </label>
                <input
                  type="text"
                  required
                  value={booking.vehicleDetails.model}
                  onChange={(e) => setBooking(prev => ({
                    ...prev,
                    vehicleDetails: { ...prev.vehicleDetails, model: e.target.value }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Year
                </label>
                <input
                  type="text"
                  required
                  value={booking.vehicleDetails.year}
                  onChange={(e) => setBooking(prev => ({
                    ...prev,
                    vehicleDetails: { ...prev.vehicleDetails, year: e.target.value }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Color
                </label>
                <input
                  type="text"
                  required
                  value={booking.vehicleDetails.color}
                  onChange={(e) => setBooking(prev => ({
                    ...prev,
                    vehicleDetails: { ...prev.vehicleDetails, color: e.target.value }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Wash Location
              </label>
              <input
                type="text"
                required
                value={booking.location}
                onChange={(e) => setBooking(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter the address where you want your car washed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Special Instructions (Optional)
              </label>
              <textarea
                value={booking.notes}
                onChange={(e) => setBooking(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Any special instructions for the washer?"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Review Booking
              </button>
            </div>
          </form>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Review Your Booking
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Selected Service</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    {booking.selectedService?.name} - ${booking.selectedService?.basePrice}
                  </p>
                </div>
                {booking.selectedAddOns.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add-ons</h3>
                    <ul className="mt-1 space-y-1">
                      {booking.selectedAddOns.map(addon => (
                        <li key={addon.id} className="text-gray-500 dark:text-gray-400">
                          {addon.name} - ${addon.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Appointment Time</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    {booking.selectedTime?.time}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Vehicle Details</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    {booking.vehicleDetails.year} {booking.vehicleDetails.make} {booking.vehicleDetails.model} - {booking.vehicleDetails.color}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Location</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">{booking.location}</p>
                </div>
                {booking.notes && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Special Instructions</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">{booking.notes}</p>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900 dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setCurrentStep('service')}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Start Over
                </button>
                <button
                  onClick={() => {
                    // Here we would normally submit the booking to the backend
                    alert('Booking submitted! This is just a mock submission.');
                  }}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex items-center relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep === step.id
                        ? 'bg-blue-500 text-white'
                        : steps.findIndex(s => s.id === currentStep) > index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {steps.findIndex(s => s.id === currentStep) > index ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      steps.findIndex(s => s.id === currentStep) > index
                        ? 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mt-12">{renderStep()}</div>
      </div>
    </MainLayout>
  );
} 