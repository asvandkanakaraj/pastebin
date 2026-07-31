#!/bin/sh

# setup-env.sh
# Validates production environment variables and scaffolds .env.production if missing

ENV_FILE=".env.production"

echo "=== PasteBin Production Environment Validator ==="

# Check if env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "⚠️  $ENV_FILE not found! Generating template..."
  
  # Generate default secure secret keys
  GEN_JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "prod-super-secret-key-change-me")
  
  cat <<EOF > "$ENV_FILE"
# Production Environment Setup
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://postgres:postgres_secure_password@postgres:5432/pastebin?schema=public"
JWT_SECRET="$GEN_JWT_SECRET"
APP_NAME="PasteBin Production"
EOF
  echo "✓ Generated default $ENV_FILE template."
fi

# Load variables
echo "Validating environment values from $ENV_FILE..."
errors=0

check_var() {
  var_name=$1
  # Extract value from file
  val=$(grep -E "^$var_name=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
  
  if [ -z "$val" ]; then
    echo "❌ Missing required variable: $var_name"
    errors=$((errors + 1))
  else
    echo "✓ Found $var_name"
  fi
}

check_var "DATABASE_URL"
check_var "JWT_SECRET"
check_var "PORT"
check_var "NODE_ENV"

if [ "$errors" -gt 0 ]; then
  echo "❌ Environment check failed with $errors errors. Please fix $ENV_FILE before launching production nodes."
  exit 1
else
  echo "✅ Production environment variables validated successfully!"
  exit 0
fi
