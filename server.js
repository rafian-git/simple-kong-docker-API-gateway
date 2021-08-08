'use strict';

const express = require('express');

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', function (req, res) {
	return res.status(200).json({
		status: 200,
		message: "✨ Yay! It's working 🥳",
	  });
});

app.listen(PORT, HOST);
console.log(`🚀 Server running on http://${HOST}:${PORT} 🚀`);
