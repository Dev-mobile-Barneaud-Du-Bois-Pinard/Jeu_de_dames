import {userSchema} from "./setupDB.mjs";
import mongoose  from 'mongoose';
console.log('init database');

main().catch(err => console.log(err));

async function main() {

  await mongoose.connect('mongodb://localhost:27017/test');

  const User = mongoose.model('User', userSchema);

  var userAdd = new User({login: 'coco58', mdp: 'coco58pwd', nbVictoire: 10, nbDefaite :0});
  await userAdd.save();

  userAdd = new User({login: 'superman78', mdp: 'superman78pwd', nbVictoire: 5, nbDefaite :5});
  await userAdd.save();

  userAdd = new User({login: 'toto', mdp: 'totopwd', nbVictoire: 2, nbDefaite :3});
  await userAdd.save();

  userAdd = new User({login: 'tata', mdp: 'tatapwd', nbVictoire: 0, nbDefaite :0});
  await userAdd.save();

  const users = await User.find();
  console.log("Tout les users : "+users);

}





