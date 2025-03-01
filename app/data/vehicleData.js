// Vehicle makes and models data for dropdown fields
export const carMakes = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Buick', 'Cadillac', 
  'Chevrolet', 'Chrysler', 'Dodge', 'Ferrari', 'Fiat', 'Ford', 'Genesis', 'GMC', 
  'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 
  'Lexus', 'Lincoln', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 
  'Nissan', 'Porsche', 'Ram', 'Rolls-Royce', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
];

// Common models by make
export const carModelsByMake = {
  'Acura': ['ILX', 'MDX', 'NSX', 'RDX', 'TLX'],
  'Alfa Romeo': ['4C', 'Giulia', 'Stelvio'],
  'Aston Martin': ['DB11', 'DBS', 'Vantage'],
  'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'e-tron', 'Q3', 'Q5', 'Q7', 'Q8', 'R8', 'TT'],
  'Bentley': ['Bentayga', 'Continental', 'Flying Spur'],
  'BMW': ['2 Series', '3 Series', '4 Series', '5 Series', '7 Series', '8 Series', 'i3', 'i8', 'X1', 'X3', 'X5', 'X7', 'Z4'],
  'Buick': ['Enclave', 'Encore', 'Envision', 'LaCrosse', 'Regal'],
  'Cadillac': ['CT4', 'CT5', 'Escalade', 'XT4', 'XT5', 'XT6'],
  'Chevrolet': ['Blazer', 'Bolt', 'Camaro', 'Colorado', 'Corvette', 'Equinox', 'Malibu', 'Silverado', 'Suburban', 'Tahoe', 'Traverse'],
  'Chrysler': ['300', 'Pacifica'],
  'Dodge': ['Challenger', 'Charger', 'Durango', 'Grand Caravan', 'Journey'],
  'Ferrari': ['488', '812', 'F8', 'Portofino', 'Roma'],
  'Fiat': ['500', '500X'],
  'Ford': ['Bronco', 'EcoSport', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150', 'Mustang', 'Ranger'],
  'Genesis': ['G70', 'G80', 'G90', 'GV80'],
  'GMC': ['Acadia', 'Canyon', 'Sierra', 'Terrain', 'Yukon'],
  'Honda': ['Accord', 'Civic', 'CR-V', 'HR-V', 'Odyssey', 'Passport', 'Pilot', 'Ridgeline'],
  'Hyundai': ['Accent', 'Elantra', 'Ioniq', 'Kona', 'Palisade', 'Santa Fe', 'Sonata', 'Tucson', 'Veloster'],
  'Infiniti': ['Q50', 'Q60', 'QX50', 'QX60', 'QX80'],
  'Jaguar': ['E-Pace', 'F-Pace', 'F-Type', 'I-Pace', 'XE', 'XF', 'XJ'],
  'Jeep': ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Renegade', 'Wrangler'],
  'Kia': ['Forte', 'K5', 'Niro', 'Optima', 'Rio', 'Seltos', 'Sorento', 'Soul', 'Sportage', 'Stinger', 'Telluride'],
  'Lamborghini': ['Aventador', 'Huracan', 'Urus'],
  'Land Rover': ['Defender', 'Discovery', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'],
  'Lexus': ['ES', 'GS', 'GX', 'IS', 'LC', 'LS', 'LX', 'NX', 'RC', 'RX', 'UX'],
  'Lincoln': ['Aviator', 'Corsair', 'MKZ', 'Nautilus', 'Navigator'],
  'Maserati': ['Ghibli', 'Levante', 'Quattroporte'],
  'Mazda': ['CX-3', 'CX-30', 'CX-5', 'CX-9', 'Mazda3', 'Mazda6', 'MX-5 Miata'],
  'McLaren': ['570S', '720S', 'GT', 'Senna'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'CLA', 'CLS', 'E-Class', 'G-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'S-Class', 'SL'],
  'Mini': ['Clubman', 'Countryman', 'Hardtop'],
  'Mitsubishi': ['Eclipse Cross', 'Mirage', 'Outlander', 'Outlander Sport'],
  'Nissan': ['Altima', 'Armada', 'Frontier', 'GT-R', 'Kicks', 'Leaf', 'Maxima', 'Murano', 'Pathfinder', 'Rogue', 'Sentra', 'Titan', 'Versa'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  'Ram': ['1500', '2500', '3500', 'ProMaster'],
  'Rolls-Royce': ['Cullinan', 'Dawn', 'Ghost', 'Phantom', 'Wraith'],
  'Subaru': ['Ascent', 'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'WRX'],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y'],
  'Toyota': ['4Runner', '86', 'Avalon', 'Camry', 'Corolla', 'Highlander', 'Land Cruiser', 'Prius', 'RAV4', 'Sequoia', 'Sienna', 'Tacoma', 'Tundra'],
  'Volkswagen': ['Arteon', 'Atlas', 'Golf', 'ID.4', 'Jetta', 'Passat', 'Tiguan'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90']
};

// Generate years from current year back to 1990
export const generateYears = () => {
  const currentYear = new Date().getFullYear() + 1; // Include next year
  const years = [];
  for (let year = currentYear; year >= 1990; year--) {
    years.push(year);
  }
  return years;
}; 