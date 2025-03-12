'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar } from '@/app/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import type { BookingFormData, BookingFormProps, Service } from '@/types/booking';

export function BookingForm({
  onSubmit,
  vehicles,
  services,
  availableTimeSlots,
  isLoading = false,
  error,
}: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [filteredServices, setFilteredServices] = useState<Service[]>(services);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<BookingFormData>();

  const selectedVehicleId = watch('vehicle_id');

  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
      if (vehicle) {
        setFilteredServices(
          services.filter((service) =>
            service.vehicle_types.includes(vehicle.vehicle_type)
          )
        );
      }
    }
  }, [selectedVehicleId, vehicles, services]);

  const onSubmitForm = (data: BookingFormData) => {
    onSubmit({
      ...data,
      booking_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="space-y-4">
        <Select
          onValueChange={(value) => setValue('vehicle_id', value)}
          {...register('vehicle_id', { required: 'Please select a vehicle' })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a vehicle" />
          </SelectTrigger>
          <SelectContent>
            {vehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.make} {vehicle.model} ({vehicle.license_plate})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.vehicle_id && (
          <Alert variant="destructive">
            <AlertDescription>{errors.vehicle_id.message}</AlertDescription>
          </Alert>
        )}

        <Select
          onValueChange={(value) => setValue('service_id', value)}
          {...register('service_id', { required: 'Please select a service' })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {filteredServices.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name} - ${service.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.service_id && (
          <Alert variant="destructive">
            <AlertDescription>{errors.service_id.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => {
              const formattedDate = format(date, 'yyyy-MM-dd');
              return !availableTimeSlots.some(
                (slot) => slot.date === formattedDate
              );
            }}
          />
          {!selectedDate && (
            <Alert variant="destructive">
              <AlertDescription>Please select a date</AlertDescription>
            </Alert>
          )}
        </div>

        {selectedDate && (
          <Select
            onValueChange={(value) => setValue('time_slot', value)}
            {...register('time_slot', { required: 'Please select a time slot' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a time slot" />
            </SelectTrigger>
            <SelectContent>
              {availableTimeSlots
                .filter(
                  (slot) =>
                    slot.date === format(selectedDate, 'yyyy-MM-dd')
                )
                .map((slot) => (
                  <SelectItem key={slot.id} value={slot.id}>
                    {slot.time}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
        {errors.time_slot && (
          <Alert variant="destructive">
            <AlertDescription>{errors.time_slot.message}</AlertDescription>
          </Alert>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Booking...' : 'Book Service'}
      </Button>
    </form>
  );
} 