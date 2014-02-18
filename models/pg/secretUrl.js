module.exports = function(sequelize, DataTypes) {
  return sequelize.define("SecretUrl", 
  	{
  		secret:			{ type: DataTypes.STRING },
		url:			{ type: DataTypes.STRING }
	});
}