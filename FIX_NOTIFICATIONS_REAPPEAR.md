# 🔧 Fix: Notifiche che Ricompaiono dopo Refresh

## ❌ Problema
Le notifiche vengono cancellate visivamente ma ricompaiono dopo il refresh della pagina, indicando che non vengono eliminate dal database.

## 🔍 Diagnosi

### 1. **Apri la Console del Browser** (F12)
Quando clicchi su "Cancella tutte", dovresti vedere questi log:
```
Attempting to clear all notifications for user: [user-id]
```

Se vedi un errore come:
- `permission denied for table notifications` → Problema di policy RLS
- `null value in column` → Problema di constraint
- Nessun errore ma `data: []` → Le notifiche non esistono per quell'utente

## ✅ Soluzione

### Passo 1: Esegui lo Script SQL per Fix Policy

Vai su **Supabase Dashboard → SQL Editor** ed esegui:

```sql
-- Elimina le policy esistenti
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Ricrea la policy corretta per DELETE
CREATE POLICY "Users can delete own notifications" ON notifications
FOR DELETE 
USING (auth.uid() = user_id);

-- Verifica che RLS sia abilitato
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Test: prova a cancellare una notifica manualmente
DELETE FROM notifications 
WHERE user_id = auth.uid() 
LIMIT 1
RETURNING *;
```

### Passo 2: Verifica l'User ID

Controlla che l'user_id nelle notifiche corrisponda all'utente loggato:

```sql
-- Mostra il tuo user ID corrente
SELECT auth.uid() as my_user_id;

-- Mostra le tue notifiche
SELECT id, user_id, title, created_at 
FROM notifications 
WHERE user_id = auth.uid();

-- Se non vedi notifiche, prova senza filtro (solo per debug)
SELECT id, user_id, title, created_at 
FROM notifications 
LIMIT 10;
```

### Passo 3: Test Manuale di Cancellazione

```sql
-- Prova a cancellare tutte le tue notifiche
DELETE FROM notifications 
WHERE user_id = auth.uid()
RETURNING *;
```

Se questo funziona, il problema è nel codice JavaScript.

## 🐛 Debug Avanzato

### Controlla i Log nella Console

Dopo aver cliccato "Cancella tutte", dovresti vedere:
1. `Attempting to clear all notifications for user: [uuid]`
2. `Notifications deleted from database: [array di notifiche]`

Se vedi invece:
- `Supabase delete error:` → C'è un errore specifico di Supabase
- `No userId available` → Problema di autenticazione

### Possibili Cause

1. **Policy RLS non corretta**: La policy non permette DELETE
2. **User ID mismatch**: L'user_id salvato non corrisponde a auth.uid()
3. **Token scaduto**: Prova a fare logout e login
4. **Cache del browser**: Pulisci la cache e riprova

## 🔧 Fix Temporaneo

Se hai urgenza, puoi temporaneamente disabilitare RLS (NON CONSIGLIATO per produzione):

```sql
-- SOLO PER TEST - NON USARE IN PRODUZIONE
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Dopo il test, riabilita
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

## 📊 Verifica Finale

Dopo aver applicato il fix:

1. **Ricarica la pagina**
2. **Clicca su "Cancella tutte"**
3. **Controlla la console** per i log
4. **Ricarica la pagina** - le notifiche NON dovrebbero ricomparire

Se vedi l'errore nella console, copia il messaggio completo per ulteriore debug.

## 🚀 Script Completo di Fix

Esegui tutto questo in Supabase SQL Editor:

```sql
-- 1. Backup delle notifiche (opzionale)
CREATE TEMP TABLE notifications_backup AS 
SELECT * FROM notifications;

-- 2. Fix completo delle policy
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notifications;

-- 3. Ricrea tutte le policy
CREATE POLICY "Users can view own notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
FOR INSERT WITH CHECK (true);

-- 4. Test
SELECT COUNT(*) as total_before FROM notifications WHERE user_id = auth.uid();
DELETE FROM notifications WHERE user_id = auth.uid();
SELECT COUNT(*) as total_after FROM notifications WHERE user_id = auth.uid();
```

Se `total_after` è 0, il fix ha funzionato!
