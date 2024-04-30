const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const loginSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
	password: {
    type: String,
    required: true
  },
	loginAs: {
    type: String,
    required: true
  },
	roles: String,
	rights: String,
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('login', loginSchema);


/*

var Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    const Login = sequelize.define("login", {
        id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      loginAs: {
        type: DataTypes.ENUM({
            values: ['Spl A - SO', 'Spl B - SO', 'IAS Officer', 'Super Admin', 'Spl A - ASO', 'Spl B - ASO']
          }),
        allowNull: false,
      },
      roles: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rights: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    },
    {
        freezeTableName: true,
        instanceMethods: {
            generateHash(password) {
                return bcrypt.hash(password, bcrypt.genSaltSync(8));
            },
            validPassword(password) {
                return bcrypt.compare(password, this.password);
            }
        }
    }
    );
  
    return Login;
  };*/