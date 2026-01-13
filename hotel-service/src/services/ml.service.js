import fs from "fs";
import csv from "csv-parser";
import { MultivariateLinearRegression } from "ml-regression";
import path from "path";

let model = null;

const monthToNumber = {
  'January': 1, 'February': 2, 'March': 3, 'April': 4,
  'May': 5, 'June': 6, 'July': 7, 'August': 8,
  'September': 9, 'October': 10, 'November': 11, 'December': 12
};

const roomTypes = ['Standard', 'Double', 'Triple'];
const hotelTypes = ['Resort Hotel', 'City Hotel'];

function createFeatures(month, capacity, roomType, hotelType) {
  const monthNum = typeof month === 'string' ? (monthToNumber[month] || 6) : month;
  const roomIndex = roomTypes.indexOf(roomType);
  const hotelIndex = hotelTypes.indexOf(hotelType);

  return [
    monthNum,
    capacity,
    roomIndex >= 0 ? roomIndex : 0,
    hotelIndex >= 0 ? hotelIndex : 0
  ];
}

export async function trainModel() {
  const dataPath = path.resolve(process.cwd(), "hotel_prices.csv");

  if (!fs.existsSync(dataPath)) {
    console.warn("[ML] hotel_prices.csv not found");
    return;
  }

  const X = [];
  const y = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(dataPath)
      .pipe(csv())
      .on("data", (row) => {
        try {
          const adr = parseFloat(row.adr);
          if (isNaN(adr) || adr <= 0 || adr > 1000) return;

          const month = row.arrival_date_month;
          const adults = parseInt(row.adults) || 0;
          const children = parseFloat(row.children) || 0;
          const capacity = adults + children;
          const roomType = row.reserved_room_type || 'Standard';
          const hotelType = row.hotel || 'City Hotel';

          if (capacity <= 0) return;

          X.push(createFeatures(month, capacity, roomType, hotelType));
          y.push([adr]);
        } catch (e) {
          // Skip invalid row
        }
      })
      .on("end", () => {
        if (X.length > 100) {
          model = new MultivariateLinearRegression(X, y);
          console.log(`[ML] Model trained with ${X.length} records`);
        } else {
          console.warn("[ML] Not enough data");
        }
        resolve();
      })
      .on("error", reject);
  });
}

export function predictPrice(capacity, dateStr, hotelType = "City Hotel") {
  if (!model) {
    return 100;
  }

  let month = 6;
  if (dateStr && dateStr.includes('-')) {
    month = parseInt(dateStr.split('-')[1], 10);
  }

  const features = createFeatures(month, capacity, 'Standard', hotelType);
  const prediction = model.predict(features);
  const predictedPrice = Math.max(prediction[0], 30);

  return Math.round(predictedPrice * 100) / 100;
}
