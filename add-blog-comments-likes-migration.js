require('dotenv').config({ path: '.env.local' });
require('./src/lib/db/migrations/add-blog-comments-likes');

