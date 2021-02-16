# install all required dependencies
chmod +x install.sh
sudo ./install.sh


# Run server
chmod +x server_run.sh
sudo ./server_run.sh &


# Stop server after sometime as mentioned on sleep.sh
chmod +x sleep.sh
sudo ./sleep.sh


# Get memes while the DB is clean
curl --location --request GET 'http://localhost:8081/memes'


# Post a meme
curl --location --request POST 'http://localhost:8081/memes' \
--header 'Content-Type: application/json' \
--data-raw '{
"name": "xyz",
"url": "abc.com",
"caption": "This is a meme"
}'

# Execute the GET /memes endpoint using curl
curl --location --request GET 'http://localhost:8081/memes'

# swagger ui Docs-
curl --location --request GET 'http://localhost:8080/swagger-ui/'