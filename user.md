# User API Spec

## Register User

Endpoint : POST 192.168.100.246:3333/api/v1/users

Request Body :
```json
{
    "name":"sofyan nur",
    "phone_number":"08123456789",
    "email":"sofyan@gmail.com",
    "password":"ekasa123",
}
```

Response Body When Success :
```json
{
    "status":"success",
    "message": "successfully registered user",
    "code":200,
    "token":"jwt_token",
    "data": newUser{}
}
```

Endpoint : POST /api/v1/users/avatars/:id

Request Body Profile Picture :

FormFile
```json
"avatar_file_name"
```

Response Body When Success Upload :
```json
{
    "status":"success",
    "message": "successfully upload avatar partner",
    "code":200,
    "data": {
        "avatar_file_name":"inifoto-timestamp.png",
        "is_uploaded":"true",
    }
}
```

Response Used Email Validation :
```json
{
    "status":"error",
    "code":400,
    "message":"this email has been used",
}
```
Response Validation Error :
```json
{
    "status":"error",
    "code":400,
    "message":"error validations"
    "error": error{}
}
```
## Login User
Endpoint : POST 192.168.100.246:3333/api/v1/auth/login

Request Body :
```json
{
    "email":"sofyan@gmail.com",
    "password":"ekasa123",
}
```
Response Body :
```json
{
    "status":"success",
    "message": "successfully user login",
    "code":200,
    "token":"jwt_token",
    "data": User{}
}
```

## Register Partner

Endpoint : POST /api/v1/partners

Request Body :
```json
{
    "name":"sofyan nur",
    "phone_number":"08123456789",
    "email":"sofyan@gmail.com",
    "password":"ekasa123",
    "license_number":"N1194SS"
}
```

Response Body :
```json
{
    "status":"success",
    "message": "successfully registered partner",
    "code":200,
    "token":"jwt_token",
    "data": newUser{}
}
```

Response Used Email Validation :
```json
{
    "status":"error",
    "code":400,
    "message":"this email has been used",
}
```
Response Validation Error :
```json
{
    "status":"error",
    "code":400,
    "message":"error validations"
    "error": error{}
}
```

Get User By ID :

Endpoint : GET 192.168.100.246:3333/api/v1/users/:id

Response Body :
```json
{
    "status":"success",
    "message": "successfully get user",
    "code":200,
    "data": User{}
}
```

Response Not Found Error :
```json
{
    "status":"error",
    "code":404,
    "message":"user not found"
}
```

Get All User :

Endpoint : GET 192.168.100.246:3333/api/v1/users

Response Body :
```json
{
    "status":"success",
    "message": "successfully get users",
    "code":200,
    "data": AllUser{}
}
```

Response Not Found Error :
```json
{
    "status":"error",
    "code":404,
    "data": AllUser{null}
}
```
