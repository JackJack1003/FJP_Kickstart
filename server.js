const { createServer } = require('http');
const next = require('next');
const express = require('express');
const mongoose = require('mongoose');
const uri =
  'mongodb+srv://admin:myMONGOslap123@fjp-cluster.o2bbxpl.mongodb.net/?retryWrites=true&w=majority';

const app = next({
  dev: process.env.NODE_ENV !== 'production',
});

async function connect() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB!');
  } catch (err) {
    console.log(err);
  }
}
//connect();

const routes = require('./routes');
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
  createServer(handler).listen(3001, (err) => {
    if (err) throw err;
    console.log('Port ready on 3001');
  });
});
