var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Publisher", 
  	{
		//facebook_id:	{ type: DataTypes.STRING, defaultValue: "", len: [1,100] },
		//google_id:		{ type: DataTypes.STRING, defaultValue: "", len: [1,100] },
		
  		userName:		{ type: DataTypes.STRING, defaultValue: "", len: [1,75] },

		email:			{ type: DataTypes.STRING, unique: true, isEmail:true, len: [6,75] },
		
		
		// 0 => free, 1 => premium, 2 => enterprise
		plan:			{ type: DataTypes.INTEGER, defaultValue: 0,  validate: { min: 0, max: 2 } },
		
		// secret code stored with messages, for publisher to be able to live monitor whilst others can't
		secret:			DataTypes.STRING,

		hash:			DataTypes.STRING,

		salt:			DataTypes.STRING

		//reputation:		{ type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

		//image_url:		{ type: DataTypes.STRING, defaultValue: "" },

		//strikes:		{ type: DataTypes.INTEGER, defaultValue: 0, allowNull: false}
	},
	
	// methods
	{
		// instance methods
  		instanceMethods: 
  		{
  			// set password hash and salt
  			setPassword: function (password, callback) {
    			var that = this;
    			bcrypt.genSalt(10, function(err, salt) {
    				if(err)return callback(err, null);
        			bcrypt.hash(password, salt, function(err, hash) {
        				if(err) {
        					//console.log('### ERROR SETTTG PASS IN USERMODEL');
        					return callback(err, null);
        				}
            			that.hash = hash;
            			that.salt = salt;
            			return callback(null, that); //success
        			});
    			});
    		},
    		// verify password
    		verifyPassword: function(password, callback) {
  				bcrypt.compare(password, this.hash, callback);
			}
  		},
  		// class methods
  		classMethods: 
  		{
			// authenticate
			authenticate: function(email, password, callback) {
    			this.find({ where: {email: email} }).success(function(user) {
    				// on success no user
    				if (!user) {
    					//console.log('didnt find user\n');
    					return callback(null, false); 
    				}
    				// on success user found
    				user.verifyPassword(password, function(err, passwordCorrect) {
        				if (err) { 
        				    //console.log('error verifying password\n');
        					return callback(err, false); 
        				}
        				if (!passwordCorrect) { 
        				    //console.log('password incorrect\n');
        					return callback(null, false); 
        				}
        				//console.log('password was cool\n');
        				return callback(null, user);
      				});
    			}).error(function(error) {
    				// on error
    				//console.log('error finding user\n');
    				//console.log(error);
    				return callback(error);
    			});
			}
		}
	});
}