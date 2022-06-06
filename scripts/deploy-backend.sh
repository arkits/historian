set -e

echo ">>> inside deploy-backend.sh"

cd /opt/software/historian/

echo ">>> pulling latest"
git pull

echo ">>> installing dependencies"
npm install

echo ">>> prisma migrations"
cd apps/backend/
npx prisma generate
npx prism migrate deploy

echo ">>> restarting backend"
pm2 restart "historian-backend"

# pm2 start --name "historian-backend" npm -- run serve:backend
