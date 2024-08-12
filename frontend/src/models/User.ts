import {BaseModel} from './BaseObject';

/** User Model */
export class UserModel extends BaseModel {
  // Add your user schema
  constructor() {
    super();
  }

  user_id: string;
  user_name: string;
  user_handle: string;
  email: string;
  password: string;
  isDoctor: boolean;
  specialization: string;
  qualification: string;
  Years_of_experience: number;
  contact_detail: ContactDetail;
  Profile_image: string;
  created_at: string;
  last_updated_at: string;
}

export class ContactDetail {
  phone_no: string;
  email_id: string;
}

export class LoginUser extends BaseModel {
  constructor() {
    super();
  }
  email: string;
  password: string;
}
