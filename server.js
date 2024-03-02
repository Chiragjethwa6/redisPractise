const express = require('express');
const axios = require('axios');
const cors = require('cors');   
const Redis = require('redis');

const DEFAULT_EXPIRATION = 3600;
const redisClient = Redis.createClient();
redisClient.connect();

const app = express();
app.listen(8000);
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.get('/photos', async (req, res) => {
    const albumId = req.query.albumId;
    const photos = await redisClient.get("photos");
    if(photos != null){
        console.log("cache hit");
        return res.json(JSON.parse(photos));
    }else{
        console.log("cache miss");
        const {data} = await axios.get('https://jsonplaceholder.typicode.com/photos', {params : {albumId}});
        redisClient.setEx(`photos`, DEFAULT_EXPIRATION, JSON.stringify(data));
        res.json(data);
    }
})
