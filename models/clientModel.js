import express from 'express';
import mongoose from 'mongoose';

const clientSchema = mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
    userId: [String],
    createdAt: {
        type: Date,
        default: new Date()
    }
})

const ClientModel = mongoose.model('ClientModel', clientSchema)
export default ClientModel