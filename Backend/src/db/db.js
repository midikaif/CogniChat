const mongoose = require('mongoose');

class Database {
    constructor(){
        this._connect();
    }

    _connect(){
        if(mongoose.connection.readyState === 1){
            console.log(
              "⚠️  Database already connected. Using existing connection.",
            );
            return;
        }

        mongoose
          .connect(process.env.MONGODB_URI)
          .then(() => {
            console.log("Database connected!");
          })
          .catch((err) => {
            console.log("Database connection failed! ", err);
          });
    }
}

module.exports = new Database();
