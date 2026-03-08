# Database Connection API Documentation

## Endpoints

### 1. Get Active Database
**GET** `/api/databases/active`

Response:
```json
{
  "success": true,
  "database": "chat-botKasir_db"
}
```

### 2. Get All Database Connections
**GET** `/api/databases`

Response:
```json
{
  "success": true,
  "databases": [
    {
      "name": "chat-botKasir_db",
      "driver": "mysql",
      "host": "localhost",
      "port": 3306,
      "database": "chat-botKasir_db",
      "user": "root",
      "password": ""
    }
  ]
}
```

### 3. Set Active Database
**POST** `/api/databases/set-active`

Request Body:
```json
{
  "database": "chat-botKasir_db"
}
```

Response:
```json
{
  "success": true,
  "message": "Active database updated"
}
```

### 4. Test Database Connection
**POST** `/api/databases/test`

Request Body:
```json
{
  "database": "chat-botKasir_db",
  "host": "localhost",
  "port": 3306,
  "user": "root",
  "password": ""
}
```

Response:
```json
{
  "success": true,
  "message": "Connection successful"
}
```

### 5. Add New Database Connection
**POST** `/api/databases`

Request Body:
```json
{
  "name": "my_connection",
  "driver": "mysql",
  "host": "localhost",
  "port": 3306,
  "database": "my_database",
  "user": "root",
  "password": ""
}
```

Response:
```json
{
  "success": true,
  "message": "Connection added successfully"
}
```

### 6. Update Database Connection
**PUT** `/api/databases/:name`

Request Body:
```json
{
  "driver": "mysql",
  "host": "localhost",
  "port": 3306,
  "database": "updated_database",
  "user": "root",
  "password": "newpassword"
}
```

Response:
```json
{
  "success": true,
  "message": "Connection updated successfully"
}
```

### 7. Delete Database Connection
**DELETE** `/api/databases/:name`

Response:
```json
{
  "success": true,
  "message": "Connection deleted successfully"
}
```

## Error Responses

All endpoints may return error responses in this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Notes

- Koneksi database disimpan di file `db-connections.json`
- Database aktif disimpan di file `active-db.json`
- Tidak bisa menghapus koneksi database yang sedang aktif
- Setiap koneksi baru akan di-test terlebih dahulu sebelum disimpan
