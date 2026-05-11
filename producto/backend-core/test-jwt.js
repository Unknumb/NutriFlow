require('dotenv').config();
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const token = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjAzZjUzY2E4LTZhYTEtNGY4Mi1hYzNmLTdjZTc2NmVkNzY2ZSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2hwcnF4bHJteHVwY3JpbmNtcmZmLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJkNzNiNTNjMy02OGE4LTQ3ZDMtYmY2My02YzA1NTBkZWY1NTciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc4MDMzMzk4LCJpYXQiOjE3NzgwMjk3OTgsImVtYWlsIjoiamF2aWVyYUBudXRyaWZsb3cuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NzgwMjk3OTh9XSwic2Vzc2lvbl9pZCI6Ijc2MDVkODc0LWZkN2ItNDNjMC05ZTI3LTQ5ODU2NjUwOWUxOCIsImlzX2Fub255bW91cyI6ZmFsc2V9.PonzC4M5EAPrugbpyw1w4rZE8mVh1px9sV2INh0H-hjZ0iet2WO9YHdG8Id7NU6RgUoUEsvolOohYj-wenXI-A";

const client = jwksClient({
  jwksUri: `${process.env.SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_ANON_KEY}`,
});

function getKey(header, callback){
  client.getSigningKey(header.kid, function(err, key) {
    if (err) {
        console.error("Error getting signing key:", err);
        return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

jwt.verify(token, getKey, { algorithms: ['ES256', 'RS256', 'HS256'] }, function(err, decoded) {
  if (err) {
      console.error("JWT Verify Error:", err.message);
  } else {
      console.log("JWT Verified! Decoded:", decoded);
  }
});
