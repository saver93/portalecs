-- Backup della policy originale (per ripristinare se necessario)

-- Per ripristinare la policy originale:
DROP POLICY IF EXISTS "Users can insert own profile or admins can insert any" ON users;

-- Ricrea la policy originale
CREATE POLICY "Only admins can insert users" ON users 
FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
