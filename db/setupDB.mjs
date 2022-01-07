import mongoose  from 'mongoose';
const { Schema } = mongoose;
export const userSchema = new Schema({
  login : String,
  mdp : String,
  nbVictoire : Number,
  nbDefaite : Number
});
export const gameSchema = new Schema({
  gameID : Number,
  status : String,
  board : Array,
  player1Login : String,
  player2Login : String,
  player1color : String,
  player2color : String,
  currentPlayer : String,
  start_time : Date,
  end_time : Date,
  playtime : Number
});

console.log('setup database');

main().catch(err => console.log(err));

async function main() {

  await mongoose.connect('mongodb://localhost:27017/test');
  const User = mongoose.model('User', userSchema);
  const Game = mongoose.model('Game', gameSchema);
  Game.findOne().sort({ _id: -1 }).exec( function(err, post) {
    console.log( post );
  });

}





