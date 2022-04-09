
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';

import postRoutes from './routes/posts.js';
import userRouter from './routes/user.js';

const app = express();

app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(cors());

app.use('/posts', postRoutes);
app.use("/user", userRouter);

app.get('/', (req, res) => {
  res.send('APP IS RUNNING')
})

//mongoDB implement 

const CONNECTION_URL = 'mongodb+srv://mike:h71211176@memories-app.scsdk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
//you should not expose your name and password like this. Create enviromental variable instead

const PORT = process.env.PORT|| 5000;
//This will automatically change when we update to Heroku

//use mongoose to connect to our database, which will return a promise
mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));

mongoose.set('useFindAndModify', false); 
//this make sure that we won't have any warning in the console 