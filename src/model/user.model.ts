export class RegisterUserRequest {
  name: string;
  phone_number: string;
  email: string;
  password: string;
}

export class UserResponse {
  name: string;
  phone_number: string;
  token?: string;
}

export class LoginUserRequest {
  email: string;
  password: string;
}

export class UpdateUserRequest {
  name?: string;
  password?: string;
}
