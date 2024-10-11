
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';


import { fetchCars } from '../slices/carsSlice';
import { addMaintenance, deleteMaintenance, fetchMaintenance, updateMaintenance } from '../slices/maintainSlice';

import Image3D from '../media/stages/cerato2018black.png';
import '../styles/maintain.css';

export default function Maintain() {

    const dispatch = useDispatch();
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { cars } = useSelector((state) => state.cars);
    const { maintenanceRecords } = useSelector((state) => state.maintenance);
    const [highlight, setHighlight] = useState(false);
    const formRef = useRef(null); // Reference for scrolling

    const [inputFields, setInputFields] = useState({
        carId: '',
        dateOfMaintenance: '',
        workshopName: '',
        description: '',
        notes: '',
        totalCost: '',
        paid: '',
        remaining: ''

    })

    useEffect(() => {
        dispatch(fetchCars());
        dispatch(fetchMaintenance()); // Fetch maintenance records when component mounts
    }, [dispatch]);




    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputFields((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteMaintenance(id));
                Swal.fire(
                    'Deleted!',
                    'The maintenance record has been deleted.',
                    'success'
                );
            }
        });
    };

    const handleEdit = (record) => {

        if (record._id) {
            setEditingRecord(record._id);
            setInputFields({
                carId: record.carId._id || record.carId, // Handle both populated or ID-only carId
                dateOfMaintenance: new Date(record.dateOfMaintenance).toISOString().slice(0, 16), // Format the date correctly
                workshopName: record.workshopName,
                description: record.description,
                notes: record.notes,
                totalCost: record.totalCost,
                paid: record.paid,
                remaining: record.remaining
            });
            formRef.current.scrollIntoView({ behavior: 'smooth' });
            setHighlight(true);

            // Remove the highlight effect after 1.5 seconds
            setTimeout(() => setHighlight(false), 1500);
        } else {
            console.error("Record ID is missing or undefined.");
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingRecord) {
            // If editing, dispatch update action with the correct structure
            await dispatch(updateMaintenance({ maintenanceId: editingRecord, ...inputFields }));
            // dispatch(fetchMaintenance());
        } else {
            // If adding a new record, dispatch add action
            await dispatch(addMaintenance(inputFields));

        }

        dispatch(fetchMaintenance());

        // Reset form and editing state
        setEditingRecord(null);
        setInputFields({
            carId: '',
            dateOfMaintenance: '',
            workshopName: '',
            description: '',
            notes: '',
            totalCost: '',
            paid: '',
            remaining: ''
        });
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredRecords = maintenanceRecords.filter((record) => {
        const workshopName = record.workshopName?.toLowerCase() || "";
        const description = record.description?.toLowerCase() || "";
        const notes = record.notes?.toLowerCase() || "";
        const totalPrice = record.totalPrice?.toString() || "";
        const carName = record.carId?.carName?.toLowerCase() || ""; // Add carName handling

        return (
            workshopName.includes(searchTerm.toLowerCase()) ||
            description.includes(searchTerm.toLowerCase()) ||
            notes.includes(searchTerm.toLowerCase()) ||
            totalPrice.includes(searchTerm) ||
            carName.includes(searchTerm.toLowerCase()) // Include carName in the filter
        );
    });
    // const handleSearch = (e) => {
    //     setSearchTerm(e.target.value);
    // };

    // const filteredRecords = maintenanceRecords.filter((record) =>
    //     record.workshopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     record.description.toLowerCase().includes(searchTerm.toLowerCase())


    // );

    return (
        <>
            <div className="MainSectionMaintain">
                <div className="MaintainSection">
                    <div className="EnterMaintainContainer">
                        <h2>Add A Maintenance Record</h2>
                        <div className="sploit">
                            <div className={`form ${highlight ? 'highlight' : ''}`} ref={formRef} id="maintenanceForm">
                                <form onSubmit={handleSubmit}>
                                    <div className="nest">
                                        <div className="pair">
                                            <label htmlFor="person-name">Workshop Name:</label>
                                            <input value={inputFields.workshopName} onChange={handleChange} name='workshopName' type="text" id="person-name" placeholder="Enter name" />
                                        </div>
                                        <div className="pair">
                                            <label htmlFor="date">Date:</label>
                                            <input value={inputFields.dateOfMaintenance} onChange={handleChange} name='dateOfMaintenance' type="datetime-local" id="date" />
                                        </div>
                                    </div>
                                    <div className="nest">
                                        <div className="pair">
                                            <label htmlFor="car-select">Select the car:</label>
                                            <input
                                                value={inputFields.carId}
                                                onChange={handleChange}
                                                name='carId'
                                                type='text'
                                                list="Cars"
                                                id="car-select"
                                                placeholder="Choose a car"
                                            />
                                            <datalist id="Cars">
                                                {cars && cars.length > 0 ? (
                                                    cars.map((car) => (
                                                        <option key={car._id} value={car._id}>{car.carName}</option>
                                                    ))
                                                ) : (
                                                    <option value="No cars available"></option>
                                                )}
                                            </datalist>
                                        </div>
                                        <div className="pair">
                                            <label htmlFor="maintain-description">Description of maintenance:</label>
                                            <input name='description' value={inputFields.description} onChange={handleChange} type="text" id="maintain-description" placeholder="Maintenance details" />
                                        </div>
                                    </div>
                                    <div className="nest">
                                        <div className="pair">
                                            <label htmlFor="notes">Notes:</label>
                                            <textarea value={inputFields.notes} onChange={handleChange} name='notes' id="notes" placeholder="Additional notes"></textarea>
                                        </div>
                                        <div className="pair">
                                            <label htmlFor="total-price">Total Price:</label>
                                            <input value={inputFields.totalCost} onChange={handleChange} name='totalCost' type="number" id="total-price" placeholder="Enter total price" />
                                        </div>
                                    </div>
                                    <div className="nest">
                                        <div className="pair">
                                            <label htmlFor="paid">Paid:</label>
                                            <input value={inputFields.paid} onChange={handleChange} name='paid' type="number" id="paid" placeholder="Amount paid" />
                                        </div>
                                        <div className="pair">
                                            <label htmlFor="remaining">Remaining:</label>
                                            <input value={inputFields.totalCost - inputFields.paid} name='remaining' type="number" id="remaining" placeholder="Remaining amount" readOnly />
                                        </div>
                                    </div>
                                    <input className="submitMaintain" type="submit" value="Submit" />
                                </form>
                            </div>

                            <div className="CarPlace">
                                <img src={Image3D} alt='carImage' />
                            </div>
                        </div>
                    </div>
                    <div className="table-container">
                        <h2>Maintenance Records</h2>
                        <input
                            type="text"
                            id="searchInput"
                            placeholder="🔍 Search Maintenance Records"
                            value={searchTerm}
                            onChange={handleSearch} // Apply the search handler
                        />
                        <table id="maintenanceTable">
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Workshop</th>
                                    <th>Date</th>
                                    <th>Car</th>
                                    <th>Maintenance Description</th>
                                    <th>Notes</th>
                                    <th>Total Price</th>
                                    <th>Paid</th>
                                    <th>Remaining</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords && filteredRecords.length > 0 ? (
                                    filteredRecords.map((record) => (
                                        <tr key={record._id}>
                                            <td>{record.maintenanceId}</td>
                                            <td>{record.workshopName}</td>
                                            <td>{record.dateOfMaintenance}</td>
                                            <td>{typeof record.carId === 'object' ? record.carId.carName : record.carId}</td>
                                            <td>{record.description}</td>
                                            <td>{record.notes}</td>
                                            <td>{record.totalCost}</td>
                                            <td>{record.paid}</td>
                                            <td>{record.totalCost - record.paid}</td>
                                            <td>
                                                <button onClick={() => handleEdit(record)}>Edit</button>
                                                <button onClick={() => handleDelete(record._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10">No records available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}