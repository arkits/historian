set -e

pwd

cd /home/arkits/software/historian

git pull

cd src/backend

yarn

pm2 restart "historian-backend"

# pm2 start --name "historian-backend" npm -- start