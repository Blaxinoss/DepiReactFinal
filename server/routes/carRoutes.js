// @ts-nocheck
const express = require("express");
const Car = require("../models/Car");
const upload = require("../middlewares/uploadImage"); // Import the upload instance
const path = require("path");
const router = express.Router();
const fs = require("fs");

// Serve static images
router.use(
  "/images",
  express.static(path.join(__dirname, "../../my-app/src/media"))
);

//Get all cars

/**
 * @swagger
 * /api/cars/:
 *   get:
 *     summary: Get all cars
 *     description: Fetches a list of all cars available in the system.
 *     tags:
 *      - car
 *     responses:
 *       200:
 *         description: A list of cars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   carId:
 *                     type: number
 *                     description: The car's unique identifier
 *                   carName:
 *                     type: string
 *                     description: The name of the car
 *                   model:
 *                     type: string
 *                     description: The model of the car
 *                   brand:
 *                     type: string
 *                     description: The brand of the car
 *                   year:
 *                     type: number
 *                     description: The year the car was manufactured
 *                   carPlate:
 *                     type: string
 *                     description: The car's license plate
 *                   rentalRate:
 *                     type: number
 *                     description: Rental price per day for the car
 *                   isAvailable:
 *                     type: boolean
 *                     description: Availability status of the car
 *                   imageUrl:
 *                     type: string
 *                     description: URL of the car image
 *                   ownerName:
 *                     type: string
 *                     description: The owner's name
 *                   kilosRightNow:
 *                     type: number
 *                     description: Current kilometers on the car
 *                   lastOilChangeDate:
 *                     type: string
 *                     format: date
 *                     description: Date of the car's last oil change
 *       500:
 *         description: Error fetching cars
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching cars
 *                 error:
 *                   type: string
 */

router.get("/", async (req, res) => {
  try {
    const cars = await Car.find(); // Fetch all rents directly
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cars", error });
  }
});

// Add a new car

/**
 * @swagger
 * /api/cars/add:
 *   post:
 *     summary: Add a new car
 *     description: Adds a new car to the system with details like name, plate, model, brand, rental rate, and more. An image can also be uploaded.
 *     tags:
 *      - car
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - carName
 *               - carPlate
 *               - model
 *               - brand
 *               - year
 *               - rentalRate
 *               - ownerName
 *               - kilosRightNow
 *               - lastOilChangeDate
 *             properties:
 *               carName:
 *                 type: string
 *                 description: The name of the car
 *               carPlate:
 *                 type: string
 *                 description: The car's license plate
 *               model:
 *                 type: string
 *                 description: The car model
 *               brand:
 *                 type: string
 *                 description: The car brand
 *               year:
 *                 type: number
 *                 description: The year the car was manufactured
 *               rentalRate:
 *                 type: number
 *                 description: The rental price per day
 *               isAvailable:
 *                 type: boolean
 *                 description: Availability status of the car
 *               carImage:
 *                 type: string
 *                 format: binary
 *                 description: An optional image of the car (uploaded file)
 *               ownerName:
 *                 type: string
 *                 description: The name of the car's owner
 *               kilosRightNow:
 *                 type: number
 *                 description: The current kilometers on the car
 *               lastOilChangeDate:
 *                 type: string
 *                 format: date
 *                 description: The date of the last oil change
 *     responses:
 *       201:
 *         description: Car added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Car added successfully
 *                 car:
 *                   type: object
 *                   properties:
 *                     carId:
 *                       type: number
 *                       description: The car's unique identifier
 *                     carName:
 *                       type: string
 *                     carPlate:
 *                       type: string
 *                     model:
 *                       type: string
 *                     brand:
 *                       type: string
 *                     year:
 *                       type: number
 *                     rentalRate:
 *                       type: number
 *                     isAvailable:
 *                       type: boolean
 *                     imageUrl:
 *                       type: string
 *                       description: URL of the car image
 *                     ownerName:
 *                       type: string
 *                     kilosRightNow:
 *                       type: number
 *                     lastOilChangeDate:
 *                       type: string
 *                       format: date
 *       500:
 *         description: Error adding car
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error adding car
 *                 error:
 *                   type: string
 */

router.post("/add", upload.single("carImage"), async (req, res) => {
  const {
    carName,
    carPlate,
    model,
    brand,
    year,
    rentalRate,
    isAvailable,
    ownerName,
    kilosRightNow,
    lastOilChangeDate,
  } = req.body;
  const imageUrl = req.file ? req.file.filename : null;

  try {
    // No need to include carId since it's auto-incremented
    const car = new Car({
      carName,
      carPlate,
      model,
      brand,
      year,
      rentalRate,
      isAvailable,
      imageUrl, // Optional
      ownerName,
      kilosRightNow,
      lastOilChangeDate,
    });

    await car.save();
    res.status(201).json({ message: "Car added successfully", car });
  } catch (error) {
    res.status(500).json({ message: "Error adding car", error: error.message });
  }
});

// Update a car

/**
 * @swagger
 * /api/cars/update/{id}:
 *   put:
 *     summary: Update an existing car
 *     description: Updates the details of an existing car, including name, model, brand, year, rental rate, availability, and more. You can also upload a new image for the car.
 *     tags:
 *      - car
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the car to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               carName:
 *                 type: string
 *                 description: The name of the car
 *               model:
 *                 type: string
 *                 description: The car model
 *               brand:
 *                 type: string
 *                 description: The car brand
 *               year:
 *                 type: number
 *                 description: The year the car was manufactured
 *               rentalRate:
 *                 type: number
 *                 description: The rental price per day
 *               isAvailable:
 *                 type: boolean
 *                 description: Availability status of the car
 *               carImage:
 *                 type: string
 *                 format: binary
 *                 description: An optional image of the car (uploaded file)
 *               ownerName:
 *                 type: string
 *                 description: The name of the car's owner
 *               kilosRightNow:
 *                 type: number
 *                 description: The current kilometers on the car
 *               lastOilChangeDate:
 *                 type: string
 *                 format: date
 *                 description: The date of the last oil change
 *     responses:
 *       200:
 *         description: Car updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Car updated successfully
 *                 updatedCar:
 *                   type: object
 *                   properties:
 *                     carId:
 *                       type: number
 *                       description: The car's unique identifier
 *                     carName:
 *                       type: string
 *                     carPlate:
 *                       type: string
 *                     model:
 *                       type: string
 *                     brand:
 *                       type: string
 *                     year:
 *                       type: number
 *                     rentalRate:
 *                       type: number
 *                     isAvailable:
 *                       type: boolean
 *                     imageUrl:
 *                       type: string
 *                       description: URL of the car image
 *                     ownerName:
 *                       type: string
 *                     kilosRightNow:
 *                       type: number
 *                     lastOilChangeDate:
 *                       type: string
 *                       format: date
 *       404:
 *         description: Car not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Car not found
 *       500:
 *         description: Error updating car
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating car
 *                 error:
 *                   type: string
 */

router.put("/update/:id", upload.single("carImage"), async (req, res) => {
  const carId = req.params.id;
  const {
    carName,
    model,
    brand,
    year,
    rentalRate,
    isAvailable,
    ownerName,
    kilosRightNow,
    lastOilChangeDate,
  } = req.body;
  const imageUrl = req.file ? req.file.filename : null; // Get image URL from the uploaded file (optional)

  try {
    // Create an object to hold the updated data
    const updateData = {
      carName,
      model,
      brand,
      year,
      rentalRate,
      isAvailable,
      ownerName,
      kilosRightNow,
      lastOilChangeDate,
    };

    // Only update imageUrl if it is provided
    if (imageUrl) {
      updateData.imageUrl = imageUrl; // Update imageUrl only if an image is uploaded
    }

    const updatedCar = await Car.findByIdAndUpdate(carId, updateData, {
      new: true,
    });

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json({ message: "Car updated successfully", updatedCar });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating car", error: error.message });
  }
});

// Delete a car

/**
 * @swagger
 * /api/cars/{id}:
 *   delete:
 *     summary: Delete a car by ID
 *     description: Deletes a car from the system using its unique identifier and removes the associated image file if it exists.
 *     tags:
 *      - car
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the car to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car record and image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Car record and image deleted successfully
 *       404:
 *         description: Car record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Car record not found
 *       500:
 *         description: Error deleting car
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error deleting car
 *                 error:
 *                   type: string
 */

router.delete("/:id", async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    if (!deletedCar) {
      return res.status(404).json({ message: "Car record not found" });
    }

    // Delete the image file from the server if it exists
    if (deletedCar.imageUrl) {
      const imagePath = path.join(
        __dirname,
        "../../my-app/src/media",
        path.basename(deletedCar.imageUrl)
      ); // Correct the path to match the new storage location
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting the image:", err);
        }
      });
    }

    res.json({ message: "Car record and image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Car", error });
  }
});

module.exports = router;
