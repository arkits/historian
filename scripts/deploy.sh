set -e

pwd

cd /home/arkits/software/historian

git pull

pm2 restart "historian"

# pm2 start --name "historian" npm -- start