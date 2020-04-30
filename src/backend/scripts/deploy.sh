set -e

pwd

cd /home/arkits/software/historian

git pull

cd src/backend

pm2 restart "historian"

# pm2 start --name "historian" npm -- start