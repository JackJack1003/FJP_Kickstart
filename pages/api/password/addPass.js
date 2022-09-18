import mongoose from 'mongoose';
import pass from '../../../models/passwordModel';
const uri =
  'mongodb+srv://admin:myMONGOslap123@fjp-cluster.o2bbxpl.mongodb.net/?retryWrites=true&w=majority';

// const uri =
//   'mongodb://:admin:myMONGOslap123@fjp-cluster-shard-00-00.scxjr.mongodb.net:27017,-cluster0-shard-00-01.scxjr.mongodb.net:27017,-cluster0-shard-00-02.scxjr.mongodb.net:27017/?ssl=true&replicaSet=atlas--shard-0&authSource=admin&retryWrites=true&w=majority';
export default async function handler(req, res) {
  //const { username: username, password: password } = req.body;
  await mongoose.connect(uri);
  console.log('Creating document');
  const test = await pass.create(req.body);
  console.log('Document made');
}
